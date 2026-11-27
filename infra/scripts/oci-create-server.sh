#!/usr/bin/env bash
# Creates the eSchool server on Oracle Cloud Always Free (Ampere A1, Ubuntu 24.04 ARM).
# Run in OCI Cloud Shell (top right ">_" icon, already signed in), or locally after `oci session authenticate`
# (Git Bash on Windows works; with a session profile the script sets OCI_CLI_AUTH=security_token itself;
#  OCI_BIN=/path/to/oci.exe when oci is not on PATH).
#   bash oci-create-server.sh "ssh-ed25519 AAAA... comment"
# Makes: VCN + internet gateway + public subnet, opens TCP 22/80/443 (+ UDP 443), launches the VM,
# prints its public IP. Safe to re-run after "Out of host capacity": it reuses what already exists.
set -euo pipefail

SSH_PUBKEY="${1:?pass your SSH public key (the contents of the .pub file) as the first argument}"
CONFIG="${OCI_CLI_CONFIG_FILE:-$HOME/.oci/config}"
if [ -z "${OCI_TENANCY:-}" ] && [ -f "$CONFIG" ]; then
  OCI_TENANCY="$(grep -m1 "^tenancy" "$CONFIG" | cut -d= -f2 | tr -d ' \r')"
  grep -q "^security_token_file" "$CONFIG" && export OCI_CLI_AUTH="${OCI_CLI_AUTH:-security_token}"
fi
C="${OCI_TENANCY:?no tenancy: run in OCI Cloud Shell or after oci session authenticate}"   # root compartment
SHAPE=VM.Standard.A1.Flex
OCPUS="${OCPUS:-2}"
MEM_GB="${MEM_GB:-12}"
NAME=eschool-server

OCI="${OCI_BIN:-oci}"
oci() { "$OCI" "$@"; }
# --raw-output; strip the CR that the Windows build of the CLI prints.
q() { oci "$@" --raw-output | tr -d '\r'; }
# Windows CLI needs a Windows path for files.
native_path() { cygpath -w "$1" 2>/dev/null || printf "%s" "$1"; }

echo "== Network"
VCN=$(q network vcn list -c "$C" --display-name eschool-vcn --query 'data[0].id' 2>/dev/null || true)
if [ -z "$VCN" ]; then
  VCN=$(q network vcn create -c "$C" --cidr-blocks '["10.0.0.0/16"]' --display-name eschool-vcn \
    --dns-label eschool --wait-for-state AVAILABLE --query data.id)
  IGW=$(q network internet-gateway create -c "$C" --vcn-id "$VCN" --is-enabled true \
    --display-name eschool-igw --wait-for-state AVAILABLE --query data.id)
  RT=$(q network vcn get --vcn-id "$VCN" --query 'data."default-route-table-id"')
  oci network route-table update --rt-id "$RT" --force --route-rules \
    "[{\"destination\":\"0.0.0.0/0\",\"destinationType\":\"CIDR_BLOCK\",\"networkEntityId\":\"$IGW\"}]" >/dev/null
  SL=$(q network vcn get --vcn-id "$VCN" --query 'data."default-security-list-id"')
  oci network security-list update --security-list-id "$SL" --force --ingress-security-rules '[
    {"protocol":"6","source":"0.0.0.0/0","tcpOptions":{"destinationPortRange":{"min":22,"max":22}}},
    {"protocol":"6","source":"0.0.0.0/0","tcpOptions":{"destinationPortRange":{"min":80,"max":80}}},
    {"protocol":"6","source":"0.0.0.0/0","tcpOptions":{"destinationPortRange":{"min":443,"max":443}}},
    {"protocol":"17","source":"0.0.0.0/0","udpOptions":{"destinationPortRange":{"min":443,"max":443}}},
    {"protocol":"1","source":"0.0.0.0/0","icmpOptions":{"type":3,"code":4}}
  ]' >/dev/null
fi
SUB=$(q network subnet list -c "$C" --vcn-id "$VCN" --display-name eschool-subnet --query 'data[0].id' 2>/dev/null || true)
if [ -z "$SUB" ]; then
  SUB=$(q network subnet create -c "$C" --vcn-id "$VCN" --cidr-block 10.0.0.0/24 \
    --display-name eschool-subnet --dns-label pub --wait-for-state AVAILABLE --query data.id)
fi

echo "== Image (Ubuntu 24.04 ARM)"
IMG=$(q compute image list -c "$C" --operating-system "Canonical Ubuntu" --operating-system-version "24.04" \
  --shape "$SHAPE" --sort-by TIMECREATED --sort-order DESC --query 'data[0].id')

echo "== Launch $SHAPE ($OCPUS OCPU / $MEM_GB GB), trying each availability domain"
KEYFILE=$(mktemp); echo "$SSH_PUBKEY" > "$KEYFILE"
ID=""
for AD in $(q iam availability-domain list -c "$C" --query "join(' ', data[].name)"); do
  echo "   $AD ..."
  if ID=$(q compute instance launch -c "$C" --availability-domain "$AD" --shape "$SHAPE" \
      --shape-config "{\"ocpus\":$OCPUS,\"memoryInGBs\":$MEM_GB}" --image-id "$IMG" --subnet-id "$SUB" \
      --assign-public-ip true --display-name "$NAME" --boot-volume-size-in-gbs 100 \
      --ssh-authorized-keys-file "$(native_path "$KEYFILE")" --wait-for-state RUNNING --query data.id); then
    break
  fi
  ID=""
done
rm -f "$KEYFILE"
[ -n "$ID" ] || { echo "No capacity right now. Re-run later, or: OCPUS=1 MEM_GB=6 bash $0 \"...\""; exit 1; }

IP=$(q compute instance list-vnics --instance-id "$ID" --query 'data[0]."public-ip"')
echo
echo "Server is RUNNING. Public IP: $IP"
echo "Login: ssh -i ~/.ssh/oracle_eschool ubuntu@$IP"
