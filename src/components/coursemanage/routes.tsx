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
import { CourseManageComponent } from './coursemanage.component';
import { UserPermissions } from '../../services/permission.service';
import {
  getAllLectures,
  getLecture,
  getUsers
} from '../../services/lectures.service';
import { enqueueSnackbar } from 'notistack';
import {
  getAllAssignments,
  getAssignment
} from '../../services/assignments.service';
import { LectureComponent } from './lecture';
import { getAllSubmissions } from '../../services/submissions.service';
import { AssignmentModalComponent } from './assignment-modal';
import { OverviewComponent } from './overview/overview';
import GradingTable, { GradingComponent } from './grading/grading';
import { StatsComponent } from './stats/stats';
import { SettingsComponent } from './settings/settings';
import { FileView } from './files/file-view';
import { ManualGrading } from './grading/manual-grading';
import { EditSubmission } from './grading/edit-submission';
import { CreateSubmission } from './grading/create-submission';
import { loadPermissions, shouldReload } from '../assignment/routes';

const loadLecture = async (lectureId: number, reload: boolean) => {
  try {
    const [lecture, assignments, users] = await Promise.all([
      getLecture(lectureId, reload),
      getAllAssignments(lectureId, reload),
      getUsers(lectureId, reload)
    ]);
    return { lecture, assignments, users };
  } catch (error: any) {
    enqueueSnackbar(error.message, {
      variant: 'error'
    });
    throw new Error('Could not load data!');
  }
};

const loadAssignment = async (
  lectureId: number,
  assignmentId: number,
  reload: boolean
) => {
  try {
    const [assignment, allSubmissions, latestSubmissions] = await Promise.all([
      getAssignment(lectureId, assignmentId, reload),
      getAllSubmissions(lectureId, assignmentId, 'none', true, reload),
      getAllSubmissions(lectureId, assignmentId, 'latest', true, reload)
    ]);
    return { assignment, allSubmissions, latestSubmissions };
  } catch (error: any) {
    enqueueSnackbar(error.message, {
      variant: 'error'
    });
    throw new Error('Could not load data!');
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
      element={<Page id={'course-manage'} />}
      errorElement={<ErrorPage id={'course-manage'} />}
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
        <Route index element={<CourseManageComponent />}></Route>
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
            element={<AssignmentModalComponent />}
            loader={({ params, request }) =>
              loadAssignment(+params.lid, +params.aid, shouldReload(request))
            }
            handle={{
              // functions in handle have to handle undefined data (error page is displayed afterwards)
              crumb: data => data?.assignment.name,
              link: params => `assignment/${params.aid}/`
            }}
          >
            <Route
              index
              path={''}
              element={<OverviewComponent />}
              handle={{
                crumb: data => 'Overview',
                link: params => ''
              }}
            ></Route>
            <Route
              path={'files'}
              element={<FileView />}
              handle={{
                crumb: data => 'Files',
                link: params => 'files/'
              }}
            ></Route>
            <Route
              id={'submissions/*'}
              path={'submissions'}
              element={<GradingComponent />}
              handle={{
                crumb: data => 'Submissions',
                link: params => 'submissions/'
              }}
            >
              <Route index path={''} element={<GradingTable />} />
              <Route
                path={'manual'}
                element={<ManualGrading />}
                handle={{
                  crumb: data => 'Grading View',
                  link: params => 'manual/'
                }}
              ></Route>
              <Route
                path={'edit'}
                element={<EditSubmission />}
                handle={{
                  crumb: data => 'Edit Submission',
                  link: params => 'edit/'
                }}
              ></Route>
              <Route
                path={'create'}
                element={<CreateSubmission />}
                handle={{
                  crumb: data => 'Create Submission',
                  link: params => 'create/'
                }}
              ></Route>
            </Route>
            <Route
              path={'stats'}
              element={<StatsComponent />}
              handle={{
                crumb: data => 'Stats',
                link: params => 'stats/'
              }}
            ></Route>
            <Route
              path={'settings'}
              element={<SettingsComponent />}
              handle={{
                crumb: data => 'Settings',
                link: params => 'settings/'
              }}
            ></Route>
          </Route>
        </Route>
      </Route>
    </Route>
  );
  return routes;
};
