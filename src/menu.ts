import {
  AssignmentsCommandIDs,
  CourseManageCommandIDs,
  GlobalObjects
} from './index';
import { getAllLectures } from './services/lectures.service';
import { Lecture } from './model/lecture';
import { getAllAssignments } from './services/assignments.service';
import { AssignmentDetail } from './model/assignmentDetail';
import { Menu } from '@lumino/widgets';

const getTargetCommand = (
  lecture: Lecture,
  assignment: AssignmentDetail | null,
  baseCommand: string
) => {
  if (assignment) {
    return `${baseCommand}/${lecture.id}/assignment/${assignment.id}`;
  } else {
    return `${baseCommand}/${lecture.id}`;
  }
};

const addTargetCommand = (
  lecture: Lecture,
  assignment: AssignmentDetail | null,
  baseCommand: string
) => {
  const command = getTargetCommand(lecture, assignment, baseCommand);
  const label = assignment === null ? 'Overview' : assignment.name;
  const path =
    assignment === null
      ? `/lecture/${lecture.id}`
      : `/lecture/${lecture.id}/assignment/${assignment.id}`;
  if (!GlobalObjects.commands.hasCommand(command)) {
    GlobalObjects.commands.addCommand(command, {
      label: label,
      execute: () =>
        GlobalObjects.commands.execute(baseCommand, {
          path: path
        })
    });
  }
  return command;
};

const updateCommands = (
  lectureAssignments: { lecture: Lecture; assignments: AssignmentDetail[] }[],
  baseCommand: string
): { lecture: Lecture; commands: string[] }[] => {
  const targetCommands: { lecture: Lecture; commands: string[] }[] = [];
  lectureAssignments.forEach(v => {
    let command = addTargetCommand(v.lecture, null, baseCommand);
    const commands = { lecture: v.lecture, commands: [command] };
    v.assignments.forEach(a => {
      command = addTargetCommand(v.lecture, a, baseCommand);
      commands.commands.push(command);
    });
    targetCommands.push(commands);
  });
  return targetCommands;
};

export const updateMenus = async (reload: boolean = false) => {
  const aMenu = GlobalObjects.assignmentMenu;
  const cmMenu = GlobalObjects.courseManageMenu;
  const lectures = await getAllLectures(false, reload);
  const lectureAssignments = await Promise.all(
    lectures.map(async lecture => {
      const assignments = await getAllAssignments(lecture.id, reload);
      return { lecture, assignments };
    })
  );

  aMenu.clearItems();
  updateCommands(lectureAssignments, AssignmentsCommandIDs.open).forEach(v => {
    const subMenu = new Menu({ commands: GlobalObjects.commands });
    subMenu.title.label = v.lecture.name;

    v.commands.forEach(c => {
      subMenu.addItem({
        type: 'command',
        command: c
      });
    });

    aMenu.addItem({
      type: 'submenu',
      submenu: subMenu
    });
  });

  if (cmMenu) {
    cmMenu.clearItems();
    updateCommands(lectureAssignments, CourseManageCommandIDs.open).forEach(
      v => {
        const subMenu = new Menu({ commands: GlobalObjects.commands });
        subMenu.title.label = v.lecture.name;

        v.commands.forEach(c => {
          subMenu.addItem({
            type: 'command',
            command: c
          });
        });

        cmMenu.addItem({
          type: 'submenu',
          submenu: subMenu
        });
      }
    );
  }
};
