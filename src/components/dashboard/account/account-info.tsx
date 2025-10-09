'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { type User } from '@/types/user';
import { authClient } from '@/lib/auth/client';

const user = {
  name: 'Sofia Rivers',
  avatar: '/assets/avatar.png',
  jobTitle: 'Senior Developer',
  country: 'USA',
  city: 'Los Angeles',
  timezone: 'GTM-7',
} as const;

export function AccountInfo(): React.JSX.Element {
  const [profile, setProfile] = React.useState<User | null>({
    id: '',
    first_name: '',
    avatar: '',
    jobTitle: '',
    country: '',
    city: '',
    timezone: '',
    _id: '',
  });
  const fetchProfile = async (): Promise<void> => {
    const { data } = await authClient.getUser();
    if (data) {
      setProfile(data);
    }
  };

  React.useEffect(() => {
    fetchProfile().then(() => {
    })
    .catch((error) => {
      throw new Error('Failed to fetch profile', error as Error);
    });
  }, []);

  return (
    <Card>
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <div>
            <Avatar src={user.avatar} sx={{ height: '80px', width: '80px' }} />
          </div>
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="h5">{profile?.first_name}</Typography>
            <Typography color="text.secondary" variant="body2">
              {profile?.email}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {user.timezone}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
      <Divider />
      <CardActions>
        <Button fullWidth variant="text">
          Upload picture
        </Button>
      </CardActions>
    </Card>
  );
}
