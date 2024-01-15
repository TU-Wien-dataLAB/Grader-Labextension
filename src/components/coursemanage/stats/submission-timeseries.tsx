import * as React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
  Brush
} from 'recharts';
import { Box, Card, CardContent, CardHeader, Paper, Typography } from '@mui/material';
import { IStatsSubComponentProps } from './stats';
import moment from 'moment';
import { Submission } from '../../../model/submission';
import {
  NameType,
  ValueType
} from 'recharts/types/component/DefaultTooltipContent';
import { loadNumber, storeNumber } from '../../../services/storage.service';
import { useTheme } from '@mui/material/styles';

const SubmissionTimeSeriesTooltip = ({
  active,
  payload,
  label
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <Paper className="custom-tooltip">
        <Typography className="recharts-tooltip-label">
          {moment(payload[0].payload.time).format('DD. MMM')}
        </Typography>
        <Typography className="recharts-tooltip-label">{`${payload[0].value} Submission${
          payload[0].value === 1 ? '' : 's'
        }`}</Typography>
      </Paper>
    );
  }

  return null;
};

const getData = (submissions: Submission[]): { time: number; n: number }[] => {
  if (submissions.length === 0) {
    return [];
  }
  const map = submissions
    .map(s => moment(s.submitted_at).startOf('day').valueOf())
    .reduce((acc, v) => {
      const c = acc.has(v) ? acc.get(v) : 0;
      acc.set(v, c + 1);
      return acc;
    }, new Map<number, number>());

  const dates: Array<number> = [];
  const currDate = moment(Math.min(...map.keys())).subtract(2, 'days');
  const lastDate = moment();

  while (currDate.add(1, 'days').diff(lastDate) < 0) {
    dates.push(currDate.valueOf());
  }
  return dates.map(d => {
    if (map.has(d)) {
      return { time: d, n: map.get(d) };
    } else {
      return { time: d, n: 0 };
    }
  });
};

export const SubmissionTimeSeries = (props: IStatsSubComponentProps) => {
  const [data, setData] = React.useState([] as { time: number; n: number }[]);
  const darkMode = useTheme().palette.mode === 'dark';

  React.useEffect(() => {
    const d = getData(props.allSubmissions);
    setData(d);
  }, [props.allSubmissions]);

  return (
    <Card sx={{ height: 300, width: '100%' }}>
      <CardHeader title={'Submissions'} />
      <CardContent
          sx={{height:'70%'}}
      >
        {data.length === 0 ? (
          <Typography color={'text.secondary'}>No Data Available</Typography>
        ) : (
          <Box sx={{ height: '100%'}}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                height={150}
                width={250}
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 0,
                  bottom: 5
                }}
              >
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={'#0088FE'} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={'#0088FE'} stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  tickFormatter={unixTime => moment(unixTime).format('DD. MMM')}
                />
                <YAxis dataKey="n" />
                <Tooltip
                  label={'Number of Submissions'}
                  content={<SubmissionTimeSeriesTooltip />}
                />
                <Area
                  type="monotone"
                  dataKey="n"
                  stroke={'#0088FE'}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradient)"
                />
                <Brush
                  height={15}
                  startIndex={
                    loadNumber('stats-sub-brush-start', null, props.assignment) ||
                    0
                  }
                  onChange={e => {
                    storeNumber(
                      'stats-sub-brush-start',
                      (e as any).startIndex,
                      null,
                      props.assignment
                    );
                  }}
                  fill={darkMode ? '#333' : '#eee'}
                  stroke={darkMode ? "#fff": "#666"}
                  fillOpacity={darkMode ? 0.4 : 0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
