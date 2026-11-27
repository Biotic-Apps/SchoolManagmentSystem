#!/usr/bin/env bash
# One-time preparation of a fresh Ubuntu 24.04 server (tested on Oracle Cloud Always Free, Ampere A1 / arm64).
#   ssh ubuntu@<ip> 'sudo bash -s' < infra/scripts/server-bootstrap.sh
# Installs updates, automatic security updates, swap, Docker Engine + compose, opens 80/443 in the host firewall
# (Oracle's Ubuntu images REJECT everything but SSH in iptables), and creates /opt/eschool for the deploy user.
# Safe to re-run.
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

DEPLOY_USER="${DEPLOY_USER:-${SUDO_USER:-ubuntu}}"
TZ_NAME="${TZ_NAME:-Asia/Karachi}"
SWAP_GB="${SWAP_GB:-4}"

echo "== Packages and automatic security updates"
apt-get update -q
apt-get -y -q -o Dpkg::Options::=--force-confold upgrade
apt-get -y -q install ca-certificates curl unattended-upgrades iptables-persistent
dpkg-reconfigure -f noninteractive unattended-upgrades
timedatectl set-timezone "$TZ_NAME"

echo "== Swap (${SWAP_GB} GB)"
if ! swapon --show | grep -q /swapfile; then
  fallocate -l "${SWAP_GB}G" /swapfile
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null
  swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
sysctl -q -w vm.swappiness=10
echo 'vm.swappiness=10' > /etc/sysctl.d/99-eschool.conf

echo "== Docker Engine"
if ! command -v docker >/dev/null; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  . /etc/os-release
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -q
  apt-get -y -q install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi
systemctl enable --now docker
usermod -aG docker "$DEPLOY_USER"

echo "== Host firewall: allow 80/tcp, 443/tcp, 443/udp (before Oracle's REJECT rule)"
open_port() {
  iptables -C INPUT -p "$1" --dport "$2" -m state --state NEW -j ACCEPT 2>/dev/null \
    || iptables -I INPUT 5 -p "$1" --dport "$2" -m state --state NEW -j ACCEPT
}
open_port tcp 80
open_port tcp 443
open_port udp 443
netfilter-persistent save >/dev/null

echo "== App folder"
install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" -m 750 /opt/eschool /opt/eschool/infra /opt/eschool/backups

echo "Done. $(docker --version); $(docker compose version)"
