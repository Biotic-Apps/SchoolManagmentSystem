export class SetupEntityDto {
  id!: string;
  code!: string;
  name!: string;
}

export class SetupPrincipalDto {
  id!: string;
  name!: string;
  email!: string | null;
  phone!: string | null;
  /** Only when generated; shown once, never stored or sent anywhere else. */
  temporaryPassword?: string;
}

export class SetupSessionDto {
  id!: string;
  name!: string;
  /** YYYY-MM-DD */
  startDate!: string;
  endDate!: string;
}

export class SetupCountsDto {
  classes!: number;
  sections!: number;
  subjects!: number;
  /** Class × subject curriculum links. */
  classSubjects!: number;
  /** Bell schedule rows (all days, breaks included). */
  periods!: number;
}

export class SchoolSetupResultDto {
  school!: SetupEntityDto;
  branch!: SetupEntityDto;
  principal!: SetupPrincipalDto;
  /** null when `academics.createSession` is false. */
  session!: SetupSessionDto | null;
  counts!: SetupCountsDto;
}
