import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { ExamType } from '../../../../generated/prisma/client';
import { StudentSkillDto } from '../../skills/dto/skill.dto';

export class ResultQueryDto {
  @IsUUID()
  examId!: string;

  @IsOptional()
  @IsUUID()
  sectionId?: string;
}

export class SubjectResultDto {
  subjectId!: string;
  name!: string;
  marks!: number | null;
  maxMarks!: number;
  absent!: boolean;
  grade!: string | null;
  passed!: boolean;
}

export class StudentResultDto {
  studentId!: string;
  name!: string;
  rollNo!: number | null;
  examId!: string;
  classId!: string;
  sectionId!: string;
  @ApiProperty({ type: [SubjectResultDto] })
  subjects!: SubjectResultDto[];
  totalMarks!: number;
  maxTotal!: number;
  percent!: number;
  grade!: string;
  /** Rank in the section; null when positions are off for the branch. */
  position!: number | null;
  /** Students with a result in the section. */
  sectionSize!: number;
  /** Rank across all sections of the class; null when positions are off. */
  classPosition!: number | null;
  classSize!: number;
  passed!: boolean;
  remarks!: string | null;
  teacherRemark!: string | null;
}

export class PublishedResultDto extends StudentResultDto {
  examName!: string;
  @ApiProperty({ enum: ExamType })
  examType!: ExamType;
  publishedAt!: string | null;
  @ApiProperty({
    type: [StudentSkillDto],
    description: 'Rated behaviour & skills (card order)',
  })
  skills!: StudentSkillDto[];
}

export class TrendPointDto {
  examId!: string;
  examName!: string;
  /** First paper date of the exam (else the publish date). */
  date!: string | null;
  percent!: number;
}

export class StudentResultsDto {
  studentId!: string;
  name!: string;
  @ApiProperty({ type: [PublishedResultDto] })
  results!: PublishedResultDto[];
  @ApiProperty({ type: [TrendPointDto] })
  trend!: TrendPointDto[];
}
