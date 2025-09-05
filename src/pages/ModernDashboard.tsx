/**
 * Dashboard moderne inspiré du design Homies Lab
 */

import React from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Divider,
} from '@mui/material'
import {
  TrendingUp,
  Assessment,
  Group,
  Receipt,
  MoreVert,
  Visibility,
  CheckCircle,
  Schedule,
} from '@mui/icons-material'
import { useAuthStore } from '@/store/authStore'

const ModernDashboard: React.FC = () => {
  const { user } = useAuthStore()

  // Données style Homies Lab
  const statsCards = [
    {
      number: '432',
      label: 'Entreprises',
      icon: <Group />,
      color: '#6366f1',
    },
    {
      number: '24',
      label: 'Payrolls',
      icon: <Receipt />,
      color: '#10b981',
    },
    {
      number: '8%',
      label: 'Turnover Rate', 
      icon: <TrendingUp />,
      color: '#f59e0b',
    },
    {
      number: '24',
      label: 'Job Applicants',
      icon: <Assessment />,
      color: '#8b5cf6',
    },
  ]

  const employmentStatus = {
    percentComplete: 70.32,
    data: [
      { type: 'Contract', count: 450, color: '#fbbf24' },
      { type: 'Probation', count: 180, color: '#1f2937' },
    ]
  }

  const upcomingTasks = [
    {
      id: 1,
      title: 'Interview Candidate UI/UX Designer',
      description: 'Product Discussion',
      avatar: '/avatar1.jpg',
      status: 'pending',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Retro Day Celebration - HR Department',
      description: 'Management Day',
      avatar: '/avatar2.jpg',
      status: 'in-progress',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'List Employee',
      description: '',
      avatar: '/avatar3.jpg',
      status: 'completed',
      priority: 'low'
    },
  ]

  const recentEmployees = [
    {
      id: 1,
      name: 'Novita Maharny',
      email: 'novitamarr@email.com',
      role: 'UI Designer',
      status: 'Active',
      department: 'Team Product',
      action: '...'
    },
    {
      id: 2,
      name: 'Indah Edwards', 
      email: 'indah.edwards@email.com',
      role: 'UI Researcher',
      status: 'Active',
      department: 'Public Product',
      action: '...'
    },
  ]

  return (
    <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100vh', p: 3 }}>
      {/* Header moderne */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#191919', mb: 0.5 }}>
          Good Morning, {user?.first_name || user?.username}
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280', fontWeight: 400 }}>
          It's Wednesday, 11 November 2024
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Cards statistiques */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {statsCards.map((stat, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <Card 
                  sx={{ 
                    height: '120px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    border: '1px solid #e5e7eb',
                    '&:hover': { 
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#191919', mb: 0.5 }}>
                          {stat.number}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
                          {stat.label}
                        </Typography>
                      </Box>
                      <Avatar 
                        sx={{ 
                          backgroundColor: `${stat.color}15`,
                          color: stat.color,
                          width: 48,
                          height: 48
                        }}
                      >
                        {stat.icon}
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Status emploi avec graphique rond */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '300px' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#191919' }}>
                  Employment Status
                </Typography>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>

              <Box sx={{ position: 'relative', display: 'inline-flex', mx: 'auto', mb: 3 }}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: `conic-gradient(#fbbf24 ${employmentStatus.percentComplete * 3.6}deg, #e5e7eb 0deg)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#191919' }}>
                      {employmentStatus.percentComplete}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      Employment
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                {employmentStatus.data.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: item.color,
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      {item.count} {item.type}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tâches à venir */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '300px' }}>
            <CardContent sx={{ p: 3, pb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#191919' }}>
                  Schedule
                </Typography>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Button variant="contained" size="small" sx={{ mr: 1 }}>
                  Meetings
                </Button>
                <Button variant="outlined" size="small" sx={{ mr: 1 }}>
                  Tasks
                </Button>
                <Button variant="text" size="small">
                  Events
                </Button>
              </Box>

              <Box sx={{ maxHeight: '180px', overflow: 'auto' }}>
                {upcomingTasks.map((task) => (
                  <Box key={task.id} sx={{ mb: 2, p: 2, backgroundColor: '#f9fafb', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                        {task.title.charAt(0)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#191919' }}>
                          {task.title}
                        </Typography>
                        {task.description && (
                          <Typography variant="caption" sx={{ color: '#6b7280' }}>
                            {task.description}
                          </Typography>
                        )}
                      </Box>
                      <Chip
                        size="small"
                        label={task.status}
                        color={task.status === 'completed' ? 'success' : 'warning'}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Liste des employés récents */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#191919' }}>
                  List Employee
                </Typography>
                <Button variant="outlined" size="small">
                  View All
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                        EMPLOYEE ID
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                        ROLE
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                        EMAIL
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                        STATUS
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                        DATE
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                        DEPARTMENT
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                        ACTION
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentEmployees.map((employee) => (
                      <TableRow key={employee.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {employee.name.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#191919' }}>
                              {employee.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            {employee.role}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            {employee.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={employee.status}
                            color="success"
                            size="small"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            11 Nov 2024
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            {employee.department}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <MoreVert sx={{ fontSize: '18px' }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ModernDashboard