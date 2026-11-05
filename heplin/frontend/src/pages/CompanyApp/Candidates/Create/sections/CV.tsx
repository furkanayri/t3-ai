import { Button, Card, CardContent, Grid, Stack, TextField, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { Candidate } from 'src/types';

export default function Files() {
  const { values, handleBlur, handleChange, errors, touched } = useFormikContext<Candidate>();
  return (
    <Card>
      <CardContent>
        <Grid
          container
          spacing={3}
        >
          <Grid
            item
            xs={12}
            md={4}
          >
            <Typography variant="h6">CV</Typography>
            <Typography
              mt={2}
              color="text.secondary"
              variant="body2"
            >
              Define title of the job, select category and add some tags for easy management
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            md={8}
          >
            <div className="flex items-center gap-x-4">
              <Button variant="contained">Upload File</Button>
              <div>
                or manually <span className="underline">add</span>
              </div>
            </div>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
