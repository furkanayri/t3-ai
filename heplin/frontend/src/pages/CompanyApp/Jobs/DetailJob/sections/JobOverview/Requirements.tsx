import { Button, Card, CardContent, CardHeader, Tooltip } from '@mui/material';
import { EditOutlined } from '@mui/icons-material';
import { HTMLRender } from 'src/components';
import { useDetailJob } from '../../DetailJobProvider';
import { Link } from 'react-router-dom';

//Requirements kaldırıldı
export default function Requirements() {
  const { jobState } = useDetailJob();

  const job = jobState.data;

  return null;
  // return (
  //   <Card>
  //     <CardHeader
  //       title="Requirements"
  //       action={
  //         <Tooltip title="Edit requirements">
  //           <Link
  //             to={'edit/requirements'}
  //             className="flex items-center"
  //           >
  //             <Button
  //               size="small"
  //               color="inherit"
  //               sx={{ color: 'text.secondary' }}
  //               startIcon={<EditOutlined />}
  //             >
  //               Edit
  //             </Button>
  //           </Link>
  //         </Tooltip>
  //       }
  //     />
  //     <CardContent sx={{ pt: 1 }}>
  //       <div>
  //         <HTMLRender html={job?.requirements} />
  //       </div>
  //     </CardContent>
  //   </Card>
  // );
}
