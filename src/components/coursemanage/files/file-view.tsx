import { Files } from './files';
import * as React from 'react';
import { useRouteLoaderData } from 'react-router-dom';
import { Lecture } from '../../../model/lecture';
import { Assignment } from '../../../model/assignment';
import { Submission } from '../../../model/submission';
import { getAssignment } from '../../../services/assignments.service';
import { useQuery } from '@tanstack/react-query';

export const FileView = () => {
  const { lecture, assignments, users } = useRouteLoaderData('lecture') as {
    lecture: Lecture;
    assignments: Assignment[];
    users: { instructors: string[]; tutors: string[]; students: string[] };
  };
  const { assignment, allSubmissions, latestSubmissions } = useRouteLoaderData(
    'assignment'
  ) as {
    assignment: Assignment;
    allSubmissions: Submission[];
    latestSubmissions: Submission[];
  };

  const { data: assignmentState = assignment, refetch: refetchAssignment } = useQuery({
      queryKey: ['assignmentState'],
      queryFn: () => getAssignment(lecture.id, assignment.id, true)
    });

  const onAssignmentChange = async () => {
    await refetchAssignment();
  };

  return (
    <Files
      lecture={lecture}
      assignment={assignmentState}
      onAssignmentChange={onAssignmentChange}
    />
  );
};
