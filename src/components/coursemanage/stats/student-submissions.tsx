import { filterUserSubmissions, IStatsSubComponentProps } from './stats';
import React from 'react';
import { Submission } from '../../../model/submission';
import { Box, Card, CardContent, CardHeader } from '@mui/material';
import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer
} from 'recharts';
import { useTheme } from '@mui/material/styles';

const getData = (
  submissions: Submission[],
  users: { students: string[]; tutors: string[]; instructors: string[] }
): number => {
  if (users.students.length === 0) {
    return 0;
  }
  const subs = filterUserSubmissions(
    submissions,
    users.instructors.concat(users.tutors)
  );
  return subs.length / users.students.length;
};

export const StudentSubmissions = (props: IStatsSubComponentProps) => {
  const [data, setData] = React.useState(0);
  const darkMode = useTheme().palette.mode === 'dark';

  React.useEffect(() => {
    const d = getData(props.latestSubmissions, props.users);
    setData(d);
  }, [props.latestSubmissions, props.users]);

  return (
    <Card sx={{ height: 300, width: '100%' }}>
      <CardHeader
        sx={{ pb: 0 }}
        title={'Student Submissions'}
        subheader={'as % of total students'}
        subheaderTypographyProps={{ variant: 'caption' }}
      />
      <CardContent
        sx={{
          height: '70%'
        }}
      >
        <Box sx={{ height: '100%' }}>
          <ResponsiveContainer width='100%' height='100%'>
            <RadialBarChart
              cx='50%'
              cy='50%'
              innerRadius='70%'
              outerRadius='90%'
              barSize={15}
              data={[{ name: 'Submissions', value: data, fill: '#0088FE' }]}
            >
              <text fill={darkMode ? "#fff" : "#000"} fontSize={40} x={'50%'} y={'50%'} dy={12} textAnchor='middle'>
                {`${Math.floor(data * 100)}%`}
              </text>
              <PolarAngleAxis
                type='number'
                domain={[0, 1]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar background={{ fill: darkMode ? '#555' : '#eee' }} dataKey='value' angleAxisId={0} />
            </RadialBarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};
