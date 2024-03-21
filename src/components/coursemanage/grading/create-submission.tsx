import {
  Alert,
  AlertTitle,
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import * as React from 'react';
import { Lecture } from '../../../model/lecture';
import { Assignment } from '../../../model/assignment';
import { Submission } from '../../../model/submission';
import { FilesList } from '../../util/file-list';
import {
  lectureBasePath,
  makeDir,
  makeDirs
} from '../../../services/file.service';
import { Link, useOutletContext, useRouteLoaderData } from 'react-router-dom';
import { showDialog } from '../../util/dialog-provider';
import Autocomplete from '@mui/material/Autocomplete';
import moment from 'moment';
import { Contents } from '@jupyterlab/services';
import { GlobalObjects } from '../../../index';
import { openBrowser } from '../overview/util';
import ReplayIcon from '@mui/icons-material/Replay';
import {
  createSubmissionFiles,
  pushSubmissionFiles
} from '../../../services/submissions.service';
import { enqueueSnackbar } from 'notistack';
import { GraderLoadingButton } from '../../util/loading-button';
import { useMutation } from '@tanstack/react-query';

export const CreateSubmission = () => {
  const { assignment, rows, setRows } = useOutletContext() as {
    lecture: Lecture;
    assignment: Assignment;
    rows: Submission[];
    setRows: React.Dispatch<React.SetStateAction<Submission[]>>;
    manualGradeSubmission: Submission;
    setManualGradeSubmission: React.Dispatch<React.SetStateAction<Submission>>;
  };
  const { lecture, assignments, users } = useRouteLoaderData('lecture') as {
    lecture: Lecture;
    assignments: Assignment[];
    users: { instructors: string[]; tutors: string[]; students: string[] };
  };

  const [path, setPath] = React.useState(null);
  const submissionsLink = `/lecture/${lecture.id}/assignment/${assignment.id}/submissions`;
  const [userDir, setUserDir] = React.useState<string | null>(null);

  const [srcChangedTimestamp, setSrcChangeTimestamp] = React.useState(
    moment().valueOf()
  ); // now

  const createSubmissionMutation = useMutation({
    mutationFn: async () => {
      return createSubmissionFiles(lecture, assignment, userDir);
    },
    onError: (error: any) => {
      enqueueSnackbar('Error: ' + error.message, { variant: 'error' });
    },
    onSuccess: () => {
      enqueueSnackbar( `Successfully Created Submission for user: ${userDir}`, { variant: 'success' });
    }
  });

  React.useEffect(() => {
    makeDirs(`${lectureBasePath}${lecture.code}`, [
      'create',
      `${assignment.id}`,
      userDir
    ]).then(p => {
      setPath(p);
      openBrowser(p);
      GlobalObjects.docManager.services.contents.fileChanged.connect(
        (sender: Contents.IManager, change: Contents.IChangedArgs) => {
          const { oldValue, newValue } = change;
          if (!newValue.path.includes(p)) {
            return;
          }

          const modified = moment(newValue.last_modified).valueOf();
          if (srcChangedTimestamp === null || srcChangedTimestamp < modified) {
            setSrcChangeTimestamp(modified);
          }
        },
        this
      );
    });
  });

  const createSubmission = async () => {
    createSubmissionMutation.mutate();
  };

  return (
    <Box sx={{ overflow: 'auto' }}>
      <Stack direction={'column'} sx={{ flex: '1 1 100%' }}>
        <Alert severity="info" sx={{ m: 2 }}>
          <AlertTitle>Info</AlertTitle>
          If you want to create a submission for a student manually, make sure
          to follow these steps: <br />
          <br />
          1. &ensp; By selecting a student for whom you want to create
          submission, directory 'create/{assignment.id}/student_id' is
          automatically opened in File Browser on your left-hand side.
          <br />
          2. &ensp; Upload the desired files here. They will automatically
          appear in the Submission Files below.
          <br />
          3. &ensp; Choose the student for whom you want to create the
          submission.
          <br />
          4. &ensp; Push the submission.
        </Alert>
        <Typography sx={{ m: 2, mb: 0 }}>Select a student</Typography>
        <Autocomplete
          options={users['students']}
          autoHighlight
          onChange={(event: any, newUserDir: string | null) => {
            setUserDir(newUserDir);
          }}
          sx={{ m: 2 }}
          renderInput={params => (
            <TextField
              {...params}
              label="Select Student"
              inputProps={{
                ...params.inputProps
                // autoComplete: 'new-password',
              }}
            />
          )}
        />
       <Typography
        sx={{ ml: 2 }}
       >
        Submission Files
        </Typography>
        <FilesList path={path} sx={{ m: 2 }} />
        <Stack direction={'row'} sx={{ ml: 2 }} spacing={2}>
          <GraderLoadingButton
            variant="outlined"
            color="success"
            sx={{ ml: 2 }}
            onClick={async () => {
              showDialog(
                'Manual Submission',
                'Do you want to push new submission?',
                async () => {
                  await createSubmission();
                }
              );
            }}
          >
            Push Submission
          </GraderLoadingButton>
        </Stack>
        <Stack sx={{ ml: 2, mt: 3, mb: 5 }} direction={'row'}>
          <Button
            variant="outlined"
            component={Link as any}
            to={submissionsLink}
          >
            Back
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};
