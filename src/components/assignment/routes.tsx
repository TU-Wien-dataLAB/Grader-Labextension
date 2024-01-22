import * as React from 'react';
import {
  createRoutesFromElements,
  Route,
  useNavigation
} from 'react-router-dom';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import { LinkRouter, Page } from '../util/breadcrumbs';
import ErrorPage from '../util/error';

import { UserPermissions } from '../../services/permission.service';
import {
  getAllLectures,
  getLecture,
  getUsers
} from '../../services/lectures.service';
import {
  getAllAssignments,
  getAssignment
} from '../../services/assignments.service';
import { getAllSubmissions } from '../../services/submissions.service';

import { enqueueSnackbar } from 'notistack';
import { Assignment } from '../../model/assignment';
import { Lecture } from '../../model/lecture';
import { AssignmentManageComponent } from './assignmentmanage.component';
import { LectureComponent } from './lecture';
import { AssignmentComponent } from './assignment';
import { Feedback } from './feedback';

export const shouldReload = (request: Request) =>
  new URL(request.url).searchParams.get('reload') === 'true';

export const loadPermissions = async (reload: boolean) => {
  try {
    await UserPermissions.loadPermissions();
    const [lectures, completedLectures] = await Promise.all([
      getAllLectures(false, reload),
      getAllLectures(true, reload)
    ]);
    return { lectures, completedLectures };
  } catch (error: any) {
    enqueueSnackbar(error.message, {
      variant: 'error'
    });
    throw new Error('Could not load data!');
  }
};

export const loadLecture = async (lectureId: number, reload: boolean) => {
  try {
    const [lecture, assignments] = await Promise.all([
      getLecture(lectureId, reload),
      getAllAssignments(lectureId, reload, true)
    ]);
    return { lecture, assignments };
  } catch (error: any) {
    enqueueSnackbar(error.message, {
      variant: 'error'
    });
    throw new Error('Could not load data!');
  }
};

export const loadAssignment = async (
  lectureId: number,
  assignmentId: number,
  reload: boolean
) => {
  try {
    const [lecture, assignment, submissions] = await Promise.all([
      getLecture(lectureId, reload),
      getAssignment(lectureId, assignmentId, reload),
      getAllSubmissions(lectureId, assignmentId, 'none', false, reload)
    ]);
    return { lecture, assignment, submissions };
  } catch (error: any) {
    enqueueSnackbar(error.message, {
      variant: 'error'
    });
    throw error;
  }
};

function ExamplePage({ to }) {
  const navigation = useNavigation(); // router navigates to new route (and loads data)
  const loading = navigation.state === 'loading';
  return (
    <Box>
      {!loading ? (
        <Typography>
          This is an example page where the link below can be used for
          naviagation.
        </Typography>
      ) : (
        <Typography>Loading...</Typography>
      )}

      <span>Next Page: </span>
      <LinkRouter underline="hover" color="inherit" to={to} key={to}>
        {to}
      </LinkRouter>
    </Box>
  );
}

export const getRoutes = () => {
  const routes = createRoutesFromElements(
    // this is a layout route without a path (see: https://reactrouter.com/en/main/start/concepts#layout-routes)
    <Route
      element={<Page id={'assignment-manage'} />}
      errorElement={<ErrorPage id={'assignment-manage'} />}
    >
      <Route
        id={'root'}
        path={'/*'}
        loader={({ request }) => loadPermissions(shouldReload(request))}
        handle={{
          crumb: data => 'Lectures',
          link: params => '/'
        }}
      >
        <Route index element={<AssignmentManageComponent />}></Route>
        <Route
          id={'lecture'}
          path={'lecture/:lid/*'}
          loader={({ params, request }) =>
            loadLecture(+params.lid, shouldReload(request))
          }
          handle={{
            // functions in handle have to handle undefined data (error page is displayed afterwards)
            crumb: data => data?.lecture.name,
            link: params => `lecture/${params?.lid}/`
          }}
        >
          <Route index element={<LectureComponent />}></Route>
          <Route
            id={'assignment'}
            path={'assignment/:aid/*'}
            loader={({ params, request }) =>
              loadAssignment(+params.lid, +params.aid, shouldReload(request))
            }
            handle={{
              crumb: data => data?.assignment.name,
              link: params => `assignment/${params?.aid}/`
            }}
          >
            <Route index element={<AssignmentComponent />} />
            <Route
              path={'feedback/:sid'}
              element={<Feedback />}
              handle={{
                crumb: data => 'Feedback',
                link: params => `feedback/${params?.sid}/`
              }}
            ></Route>
          </Route>
        </Route>
      </Route>
    </Route>
  );
  return routes;
};
