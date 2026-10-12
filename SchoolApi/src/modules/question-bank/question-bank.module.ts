import { Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { ExamPapersController } from './exam-papers.controller';
import { QuestionsService } from './questions.service';
import { QuestionsRepository } from './questions.repository';
import { ExamPapersService } from './exam-papers.service';
import { ExamPaperPdfService } from './exam-paper-pdf.service';

/** Question Bank & Paper Generator: teachers build question banks, auto-generate exam papers. */
@Module({
  controllers: [QuestionsController, ExamPapersController],
  providers: [
    QuestionsRepository,
    QuestionsService,
    ExamPapersService,
    ExamPaperPdfService,
  ],
})
export class QuestionBankModule {}
