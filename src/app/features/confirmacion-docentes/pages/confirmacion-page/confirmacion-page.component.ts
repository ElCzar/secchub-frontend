import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ClassesTableComponent } from '../../components/classes-table/classes-table.component';
import { ConfirmSendPopupComponent } from '../../../../shared/components/confirm-send-popup/confirm-send-popup.component';
import { TeacherClassRow } from '../../models/class.models';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { TeacherClassDecisionService } from '../../services/teacher-class-decision.service';
import { UserInformationService } from '../../../../shared/services/user-information.service';
import { ParametricService } from '../../../../shared/services/parametric.service';
import { StatusDTO } from '../../../../shared/model/dto/parametric';
import { SectionInformationService } from '../../../../shared/services/section-information.service';
import { TeacherClassResponseDTO } from '../../../../shared/model/dto/admin/TeacherClassResponseDTO.model';
import { CourseResponseDTO } from '../../../../shared/model/dto/admin/CourseResponseDTO.model';
import { SectionDTO } from '../../../planificacion/services/course.service';
import { ClassResponseDTO } from '../../../../shared/model/dto/planning/ClassResponseDTO.model';
import { CourseInformationService } from '../../../../shared/services/course-information.service';
import { SemesterInformationService } from '../../../../shared/services/semester-information.service';
import { SemesterResponseDTO } from '../../../../shared/model/dto/admin/SemesterResponseDTO.model';


@Component({
  selector: 'app-confirmacion-page',
  standalone: true,
  imports: [CommonModule, ClassesTableComponent, HeaderComponent, ConfirmSendPopupComponent],
  templateUrl: './confirmacion-page.component.html',
  styleUrls: ['./confirmacion-page.component.scss'],
})
export class ConfirmacionPageComponent implements OnInit {
  accepted: TeacherClassRow[] = [];
  pending: TeacherClassRow[] = [];
  all: TeacherClassRow[] = [];

  // Parameters
  statuses: StatusDTO[] = [];
  sections: SectionDTO[] = [];
  courses: CourseResponseDTO[] = [];
  semester: SemesterResponseDTO | null = null;

  // selección de la tabla “por aceptar”
  selectedPending = new Set<string>();
  // per-row pending states received from child table (includes 'review')
  pendingStates: Record<string, 'accept' | 'reject' | 'review' | 'none'> = {};
  // collected comment requests from children: id -> message
  commentRequests: Record<string, string> = {};

  loading = true;
  // controls visibility of the confirm-send popup
  popupVisible = false;

  constructor(
    private readonly teacherClassDecisionService: TeacherClassDecisionService,
    private readonly userInformationService: UserInformationService,
    private readonly parametricService: ParametricService,
    private readonly sectionInformationService: SectionInformationService,
    private readonly courseInformationService: CourseInformationService,
    private readonly semesterInformationService: SemesterInformationService
  ) {}

  ngOnInit(): void {
    this.loadParameters();
    this.loadTeacherClasses();
  }

  private loadParameters(): void {
    this.parametricService.getAllStatuses().subscribe(statuses => {
      this.statuses = statuses;
    });
    this.sectionInformationService.findAllSections().subscribe(sections => {
      this.sections = sections;
    });
    this.courseInformationService.findAllCourses().subscribe(courses => {
      this.courses = courses;
    });
    this.semesterInformationService.getCurrentSemester().subscribe(sem => {
      this.semester = sem;
    });
  }

  private loadTeacherClasses(): void {
    this.loading = true;
    this.userInformationService.getUserInformation().subscribe(userInfo => {
      if (!userInfo) {
        this.loading = false;
        return;
      }
      
      const userId = userInfo.id;
      this.teacherClassDecisionService.getTeacherByUserId(userId).subscribe(teacher => {
        const teacherId = teacher.id;
        this.teacherClassDecisionService.getCurrentSemesterTeacherClassesByTeacher(teacherId)
          .subscribe(classes => {
            this.processTeacherClasses(classes);
            this.loading = false;
          });
      });
    });
  }

  private processTeacherClasses(classes: TeacherClassResponseDTO[]): void {
    // First, map all classes to TeacherClassRow format
    const promises = classes.map(teacherClass => this.mapToTeacherClassRow(teacherClass));
    
    // Wait for all mapping operations to complete
    Promise.all(promises).then(mappedClasses => {
      this.all = mappedClasses;
      // Filter out null values
      this.all = this.all.filter(c => c !== null);
      this.pending = this.all.filter(c => c.accepted === undefined || c.accepted === false);
      this.accepted = this.all.filter(c => c.accepted === true);
    });
  }

  private mapToTeacherClassRow(teacherClass: TeacherClassResponseDTO): Promise<TeacherClassRow> {
    return new Promise((resolve) => {
      this.teacherClassDecisionService.getClassById(teacherClass.classId).subscribe(classInfo => {
        const classInfoDTO = classInfo as ClassResponseDTO;
        const course = this.courses.find(c => c.id === classInfoDTO.courseId);
        const schedules = classInfoDTO.schedules?.map(s => {
          return `${s.day}. ${s.startTime}-${s.endTime}`;
        }) || [];

        if (teacherClass.decision !== undefined && teacherClass.decision === false) {
          resolve(null as any);
          return;
        }

        const row: TeacherClassRow = {
          teacherClassId: teacherClass.id,
          id: teacherClass.classId,
          section: this.sections.find(s => s.id === course?.sectionId)?.name || 'Desconocida',
          subject: course?.name || 'Desconocida',
          semester: this.semester ? `${this.semester.year}-${this.semester.period}` : 'Desconocida',
          schedules: schedules,
          accepted: teacherClass.decision ?? false
        };
        
        resolve(row);
      });
    });
  }

  onAccept(): void {
    // Check if there are any decisions to process
    if (!this.canSubmitAny) {
      console.warn('No decisions made to process');
      return;
    }

    // Show confirmation popup - the actual processing happens in onPopupConfirm()
    this.popupVisible = true;
  }

  get canSubmit() { return this.selectedPending.size > 0; }
  // Enable submit when there is any selected or any pending state (accept/reject/review) or comment requests
  get canSubmitAny(): boolean {
    if (this.selectedPending.size > 0) return true;
    if (Object.keys(this.commentRequests).length > 0) return true;
    for (const k of Object.keys(this.pendingStates)) {
      if ((this.pendingStates[k] ?? 'none') !== 'none') return true;
    }
    return false;
  }

  // user confirmed in the popup
  onPopupConfirm(): void {
    // Use the new service method to process mixed decisions
    this.teacherClassDecisionService.processMixedDecisions(
      this.pending, 
      this.pendingStates, 
      this.commentRequests
    ).subscribe({
      next: (results) => {
        console.log('Mixed decisions processed:', results);
        
        // Update UI based on results
        if (results.accepted.length > 0) {
          // Move accepted classes to accepted list - filter out null values
          const acceptedClassIds = new Set(
            results.accepted
              .filter(r => r?.classId != null)
              .map(r => r.classId.toString())
          );
          const movedRows = this.pending
            .filter(row => acceptedClassIds.has(row.id.toString()))
            .map(row => ({ ...row, accepted: true }));
          
          this.accepted = [...this.accepted, ...movedRows];
        }
        
        // Remove accepted and rejected classes from pending - filter out null values
        const processedClassIds = new Set([
          ...results.accepted
            .filter(r => r?.classId != null)
            .map(r => r.classId.toString()),
          ...results.rejected
            .filter(r => r?.classId != null)
            .map(r => r.classId.toString())
        ]);
        
        this.pending = this.pending.filter(row => !processedClassIds.has(row.id.toString()));
        
        // Clear states
        this.selectedPending.clear();
        this.pendingStates = {};
        this.commentRequests = {};
        this.popupVisible = false;
        
        // Show results summary
        const summary = [];
        if (results.accepted.length > 0) summary.push(`${results.accepted.length} aceptada${results.accepted.length > 1 ? 's' : ''}`);
        if (results.rejected.length > 0) summary.push(`${results.rejected.length} rechazada${results.rejected.length > 1 ? 's' : ''}`);
        if (results.reviewed.length > 0) summary.push(`${results.reviewed.length} en revisión`);
        
        if (summary.length > 0) {
          alert(`✅ Operación completada:\n${summary.join(', ')}`);
          // Refresh the page
          this.loadTeacherClasses();
        }
      },
      error: (error) => {
        console.error('Error processing decisions:', error);
        alert('❌ Error al procesar las decisiones. Por favor, inténtelo de nuevo.');
        this.popupVisible = false;
      }
    });
  }

  onPendingStateChange(states: Record<string, 'accept' | 'reject' | 'review' | 'none'>): void {
    this.pendingStates = states || {};
    // keep selectedPending in sync (accepted == selected)
    const newSel = new Set<string>();
    for (const id of Object.keys(this.pendingStates)) {
      if (this.pendingStates[id] === 'accept') newSel.add(id);
    }
    this.selectedPending = newSel;
  }

  onCommentRequest(ev: { id: string; message: string }): void {
    if (!ev?.id) return;
    this.commentRequests[ev.id] = ev.message || '';
    console.log('Solicitud de revisión añadida:', ev.id, ev.message);
  }

  // user declined in the popup
  onPopupDecline(): void {
    this.popupVisible = false;
    console.log('Cancelado envío');
  }
}

