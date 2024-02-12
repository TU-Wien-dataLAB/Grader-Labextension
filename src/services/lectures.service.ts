// Copyright (c) 2022, TU Wien
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { Lecture } from '../model/lecture';
import { request, HTTPMethod } from './request.service';

export function getAllLectures(
  complete: boolean = false,
  reload = false
): Promise<Lecture[]> {
  let url = '/lectures';
  if (complete) {
    const searchParams = new URLSearchParams({
      complete: String(complete)
    });
    url += '?' + searchParams;
  }
  return request<Lecture[]>(HTTPMethod.GET, url, null, reload);
}

export function updateLecture(lecture: Lecture): Promise<Lecture> {
  return request<Lecture, Lecture>(
    HTTPMethod.PUT,
    `/lectures/${lecture.id}`,
    lecture
  );
}

export function getLecture(
  lectureId: number,
  reload = false
): Promise<Lecture> {
  return request<Lecture>(
    HTTPMethod.GET,
    `/lectures/${lectureId}`,
    null,
    reload
  );
}

export function deleteLecture(lectureId: number): Promise<void> {
  return request<void>(HTTPMethod.DELETE, `/lectures/${lectureId}`, null);
}

export function getUsers(
  lectureId: number,
  reload: boolean = false
): Promise<{ instructors: string[]; tutors: string[]; students: string[] }> {
  return request<{
    instructors: string[];
    tutors: string[];
    students: string[];
  }>(HTTPMethod.GET, `/lectures/${lectureId}/users`, null, reload);
}
