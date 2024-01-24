import {
  AssignmentsCommandIDs,
  CourseManageCommandIDs,
  GlobalObjects
} from './index';
import { getAllLectures } from './services/lectures.service';
import { Lecture } from './model/lecture';

const getTargetCommand = (lecture: Lecture, baseCommand: string) => {
  return `${baseCommand}/${lecture.id}`;
};

const updateCommands = (lectures: Lecture[], baseCommand: string): string[] => {
  const targetCommands: string[] = [];
  lectures.forEach(l => {
    const command = getTargetCommand(l, baseCommand);
    if (!GlobalObjects.commands.hasCommand(command)) {
      GlobalObjects.commands.addCommand(command, {
        label: l.name,
        execute: () =>
          GlobalObjects.commands.execute(baseCommand, {
            path: `/lecture/${l.id}`
          })
      });
    }
    targetCommands.push(command);
  });
  return targetCommands;
};

export const updateMenus = async (reload: boolean = false) => {
  const aMenu = GlobalObjects.assignmentMenu;
  const cmMenu = GlobalObjects.courseManageMenu;
  const lectures = await getAllLectures(false, reload);

  aMenu.clearItems();
  updateCommands(lectures, AssignmentsCommandIDs.open).forEach(c => {
    aMenu.addItem({
      type: 'command',
      command: c
    });

    if (cmMenu) {
      cmMenu.clearItems();
      updateCommands(lectures, CourseManageCommandIDs.open).forEach(c => {
        cmMenu.addItem({
          type: 'command',
          command: c
        });
      });
    }
  });
};
