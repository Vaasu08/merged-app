import jsPDF from 'jspdf';
import { CareerPath } from '@/types/career';
import { skillsDatabase } from '@/data/careerData';

export interface ExportData {
  userSkills: string[];
  selectedCareer: CareerPath;
  completedSteps: string[];
  userName?: string;
  generatedDate: Date;
}

export const generateCareerPlanPDF = (data: ExportData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to add text with word wrapping
  const addText = (text: string, x: number, y: number, maxWidth?: number, fontSize: number = 12) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth || pageWidth - 40);
    doc.text(lines, x, y);
    return y + (lines.length * fontSize * 0.4) + 5;
  };

  // Helper function to add a new page if needed
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Header
  doc.setFillColor(242, 76, 53); // Primary color
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  yPosition = addText('AI Career Pathfinder - Personal Career Plan', 20, 20, undefined, 18);
  
  doc.setTextColor(0, 0, 0);
  yPosition += 10;

  // User Info Section
  yPosition = addText('Personal Information', 20, yPosition, undefined, 16);
  yPosition += 5;
  
  if (data.userName) {
    yPosition = addText(`Name: ${data.userName}`, 20, yPosition);
  }
  yPosition = addText(`Generated: ${data.generatedDate.toLocaleDateString()}`, 20, yPosition);
  yPosition += 10;

  // Selected Career Section
  checkNewPage(50);
  yPosition = addText('Recommended Career Path', 20, yPosition, undefined, 16);
  yPosition += 5;
  
  yPosition = addText(`Career: ${data.selectedCareer.title}`, 20, yPosition, undefined, 14);
  yPosition = addText(`Match: ${data.selectedCareer.matchPercentage}%`, 20, yPosition);
  yPosition = addText(`Average Salary: ${data.selectedCareer.averageSalary}`, 20, yPosition);
  yPosition = addText(`Growth Rate: ${data.selectedCareer.growthRate}`, 20, yPosition);
  yPosition += 5;
  
  yPosition = addText('Description:', 20, yPosition, undefined, 12);
  yPosition = addText(data.selectedCareer.description, 20, yPosition, pageWidth - 40);
  yPosition += 10;

  // Skills Section
  checkNewPage(60);
  yPosition = addText('Your Current Skills', 20, yPosition, undefined, 16);
  yPosition += 5;
  
  const skillNames = data.userSkills.map(skillId => 
    skillsDatabase.find(skill => skill.id === skillId)?.name || skillId
  );
  
  yPosition = addText(`Skills (${skillNames.length}): ${skillNames.join(', ')}`, 20, yPosition, pageWidth - 40);
  yPosition += 10;

  // Required Skills Section
  checkNewPage(60);
  yPosition = addText('Required Skills for This Career', 20, yPosition, undefined, 16);
  yPosition += 5;
  
  const requiredSkillNames = data.selectedCareer.requiredSkills.map(skillId => 
    skillsDatabase.find(skill => skill.id === skillId)?.name || skillId
  );
  
  yPosition = addText(`Required Skills (${requiredSkillNames.length}): ${requiredSkillNames.join(', ')}`, 20, yPosition, pageWidth - 40);
  yPosition += 10;

  // Missing Skills Section
  const missingSkills = data.selectedCareer.requiredSkills.filter(skill => !data.userSkills.includes(skill));
  if (missingSkills.length > 0) {
    checkNewPage(60);
    yPosition = addText('Skills to Learn', 20, yPosition, undefined, 16);
    yPosition += 5;
    
    const missingSkillNames = missingSkills.map(skillId => 
      skillsDatabase.find(skill => skill.id === skillId)?.name || skillId
    );
    
    yPosition = addText(`Missing Skills (${missingSkillNames.length}): ${missingSkillNames.join(', ')}`, 20, yPosition, pageWidth - 40);
    yPosition += 10;
  }

  // Action Plan Section
  checkNewPage(80);
  yPosition = addText('Action Plan - Next Steps', 20, yPosition, undefined, 16);
  yPosition += 5;
  
  data.selectedCareer.nextSteps.forEach((step, index) => {
    checkNewPage(30);
    const isCompleted = data.completedSteps.includes(step.id);
    const status = isCompleted ? '[COMPLETED]' : '[PENDING]';
    
    yPosition = addText(`${index + 1}. ${step.title} ${status}`, 20, yPosition, undefined, 12);
    yPosition = addText(`   Priority: ${step.priority} | Time: ${step.timeEstimate}`, 20, yPosition);
    yPosition = addText(`   ${step.description}`, 20, yPosition, pageWidth - 40);
    yPosition += 5;
  });

  // Resources Section
  if (data.selectedCareer.resources.length > 0) {
    checkNewPage(60);
    yPosition = addText('Recommended Resources', 20, yPosition, undefined, 16);
    yPosition += 5;
    
    data.selectedCareer.resources.forEach((resource, index) => {
      checkNewPage(25);
      yPosition = addText(`${index + 1}. ${resource.title}`, 20, yPosition, undefined, 12);
      yPosition = addText(`   Type: ${resource.type} | Provider: ${resource.provider}`, 20, yPosition);
      yPosition = addText(`   ${resource.free ? 'Free' : 'Paid'} | URL: ${resource.url}`, 20, yPosition);
      yPosition += 5;
    });
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
    doc.text('Generated by AI Career Pathfinder', 20, pageHeight - 10);
  }

  // Save the PDF
  const fileName = `career-plan-${data.selectedCareer.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

// Alternative: Generate a simple text-based export
export const generateCareerPlanText = (data: ExportData): string => {
  const skillNames = data.userSkills.map(skillId => 
    skillsDatabase.find(skill => skill.id === skillId)?.name || skillId
  );
  
  const requiredSkillNames = data.selectedCareer.requiredSkills.map(skillId => 
    skillsDatabase.find(skill => skill.id === skillId)?.name || skillId
  );
  
  const missingSkills = data.selectedCareer.requiredSkills.filter(skill => !data.userSkills.includes(skill));
  const missingSkillNames = missingSkills.map(skillId => 
    skillsDatabase.find(skill => skill.id === skillId)?.name || skillId
  );

  return `
AI CAREER PATHFINDER - PERSONAL CAREER PLAN
Generated: ${data.generatedDate.toLocaleDateString()}

RECOMMENDED CAREER PATH
=======================
Career: ${data.selectedCareer.title}
Match: ${data.selectedCareer.matchPercentage}%
Average Salary: ${data.selectedCareer.averageSalary}
Growth Rate: ${data.selectedCareer.growthRate}

Description:
${data.selectedCareer.description}

YOUR CURRENT SKILLS
===================
${skillNames.join(', ')}

REQUIRED SKILLS FOR THIS CAREER
===============================
${requiredSkillNames.join(', ')}

SKILLS TO LEARN
===============
${missingSkillNames.length > 0 ? missingSkillNames.join(', ') : 'All required skills covered!'}

ACTION PLAN - NEXT STEPS
========================
${data.selectedCareer.nextSteps.map((step, index) => {
  const isCompleted = data.completedSteps.includes(step.id);
  const status = isCompleted ? '[COMPLETED]' : '[PENDING]';
  return `${index + 1}. ${step.title} ${status}
   Priority: ${step.priority} | Time: ${step.timeEstimate}
   ${step.description}`;
}).join('\n\n')}

RECOMMENDED RESOURCES
====================
${data.selectedCareer.resources.map((resource, index) => 
  `${index + 1}. ${resource.title}
   Type: ${resource.type} | Provider: ${resource.provider}
   ${resource.free ? 'Free' : 'Paid'} | URL: ${resource.url}`
).join('\n\n')}

---
Generated by AI Career Pathfinder
For more insights, visit the Insights dashboard.
  `.trim();
};
