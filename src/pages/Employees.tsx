import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Euro, Clock, TrendingUp, Trash2 } from 'lucide-react';
import { getEmployees, saveEmployee, getTimesheets, saveTimesheet, deleteEmployee, deleteTimesheet } from '@/lib/storage';
import { Employee, Timesheet } from '@/types';
import MobileNav from '@/components/MobileNav';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>(getEmployees());
  const [timesheets, setTimesheets] = useState<Timesheet[]>(getTimesheets());
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddTimesheet, setShowAddTimesheet] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    hourlyRate: '',
  });

  const [newTimesheet, setNewTimesheet] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    hours: '',
  });

  const stats = useMemo(() => {
    const totalDue = timesheets
      .filter(t => t.status === 'due')
      .reduce((sum, t) => {
        const employee = employees.find(e => e.id === t.employeeId);
        return sum + (employee ? t.hours * employee.hourlyRate : 0);
      }, 0);

    const totalPaid = timesheets
      .filter(t => t.status === 'paid')
      .reduce((sum, t) => {
        const employee = employees.find(e => e.id === t.employeeId);
        return sum + (employee ? t.hours * employee.hourlyRate : 0);
      }, 0);

    const totalHours = timesheets.reduce((sum, t) => sum + t.hours, 0);

    return { totalDue, totalPaid, totalHours };
  }, [employees, timesheets]);

  const handleAddEmployee = () => {
    if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.hourlyRate) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    const employee: Employee = {
      id: Date.now().toString(),
      firstName: newEmployee.firstName,
      lastName: newEmployee.lastName,
      hourlyRate: parseFloat(newEmployee.hourlyRate),
      createdAt: new Date().toISOString(),
    };

    saveEmployee(employee);
    setEmployees(getEmployees());
    setNewEmployee({ firstName: '', lastName: '', hourlyRate: '' });
    setShowAddEmployee(false);
    toast.success('Employé ajouté');
  };

  const handleAddTimesheet = () => {
    if (!newTimesheet.employeeId || !newTimesheet.date || !newTimesheet.hours) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    const timesheet: Timesheet = {
      id: Date.now().toString(),
      employeeId: newTimesheet.employeeId,
      date: newTimesheet.date,
      hours: parseFloat(newTimesheet.hours),
      status: 'due',
      createdAt: new Date().toISOString(),
    };

    saveTimesheet(timesheet);
    setTimesheets(getTimesheets());
    setNewTimesheet({ employeeId: '', date: new Date().toISOString().split('T')[0], hours: '' });
    setShowAddTimesheet(false);
    toast.success('Heures enregistrées');
  };

  const handleMarkAsPaid = (timesheetId: string) => {
    const timesheet = timesheets.find(t => t.id === timesheetId);
    if (timesheet) {
      const updated = { ...timesheet, status: 'paid' as const, paidDate: new Date().toISOString() };
      saveTimesheet(updated);
      setTimesheets(getTimesheets());
      toast.success('Marqué comme payé');
    }
  };

  const handleDeleteEmployee = (employeeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmployeeToDelete(employeeId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (employeeToDelete) {
      // Delete all timesheets for this employee
      const empTimesheets = timesheets.filter(t => t.employeeId === employeeToDelete);
      empTimesheets.forEach(t => deleteTimesheet(t.id));
      
      deleteEmployee(employeeToDelete);
      setEmployees(getEmployees());
      setTimesheets(getTimesheets());
      toast.success('Employé supprimé');
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const getEmployeeTimesheets = (employeeId: string) => {
    return timesheets.filter(t => t.employeeId === employeeId);
  };

  const getEmployeeStats = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return { totalHours: 0, totalDue: 0, totalPaid: 0 };

    const empTimesheets = getEmployeeTimesheets(employeeId);
    const totalHours = empTimesheets.reduce((sum, t) => sum + t.hours, 0);
    const totalDue = empTimesheets
      .filter(t => t.status === 'due')
      .reduce((sum, t) => sum + t.hours * employee.hourlyRate, 0);
    const totalPaid = empTimesheets
      .filter(t => t.status === 'paid')
      .reduce((sum, t) => sum + t.hours * employee.hourlyRate, 0);

    return { totalHours, totalDue, totalPaid };
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground p-6">
        <h1 className="text-2xl font-bold">Employés</h1>
        <p className="text-sm opacity-90 mt-1">Gestion des heures</p>
      </header>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium flex items-center gap-1">
                <Clock className="h-3 w-3 text-primary" />
                Heures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{stats.totalHours}h</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium flex items-center gap-1">
                <Euro className="h-3 w-3 text-warning" />
                À payer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{stats.totalDue.toFixed(0)}€</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-success" />
                Payé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{stats.totalPaid.toFixed(0)}€</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setShowAddEmployee(true)} className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            Nouvel employé
          </Button>
          <Button onClick={() => setShowAddTimesheet(true)} className="flex-1" variant="outline">
            <Clock className="h-4 w-4 mr-2" />
            Saisir heures
          </Button>
        </div>

        {showAddEmployee && (
          <Card>
            <CardHeader>
              <CardTitle>Nouvel employé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Prénom</Label>
                <Input
                  value={newEmployee.firstName}
                  onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                  placeholder="Prénom"
                />
              </div>
              <div>
                <Label>Nom</Label>
                <Input
                  value={newEmployee.lastName}
                  onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                  placeholder="Nom"
                />
              </div>
              <div>
                <Label>Taux horaire (€)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={newEmployee.hourlyRate}
                  onChange={(e) => setNewEmployee({ ...newEmployee, hourlyRate: e.target.value })}
                  placeholder="15.00"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddEmployee} className="flex-1">Ajouter</Button>
                <Button onClick={() => setShowAddEmployee(false)} variant="outline" className="flex-1">
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {showAddTimesheet && (
          <Card>
            <CardHeader>
              <CardTitle>Saisir les heures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Employé</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newTimesheet.employeeId}
                  onChange={(e) => setNewTimesheet({ ...newTimesheet, employeeId: e.target.value })}
                >
                  <option value="">Sélectionner un employé</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newTimesheet.date}
                  onChange={(e) => setNewTimesheet({ ...newTimesheet, date: e.target.value })}
                />
              </div>
              <div>
                <Label>Nombre d'heures</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={newTimesheet.hours}
                  onChange={(e) => setNewTimesheet({ ...newTimesheet, hours: e.target.value })}
                  placeholder="8"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddTimesheet} className="flex-1">Enregistrer</Button>
                <Button onClick={() => setShowAddTimesheet(false)} variant="outline" className="flex-1">
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {employees.map((employee) => {
            const stats = getEmployeeStats(employee.id);
            const empTimesheets = getEmployeeTimesheets(employee.id);
            const isExpanded = selectedEmployeeId === employee.id;

            return (
              <Card key={employee.id} className="group hover:shadow-glow hover:scale-[1.01] transition-all duration-200 animate-fade-in">
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => setSelectedEmployeeId(isExpanded ? '' : employee.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        {employee.firstName} {employee.lastName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{employee.hourlyRate}€/h</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{stats.totalHours}h</div>
                        <div className="text-xs text-warning font-medium">{stats.totalDue}€ dû</div>
                      </div>
                      <Button
                        size="icon"
                        variant="outline"
                        className="opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all h-8 w-8"
                        onClick={(e) => handleDeleteEmployee(employee.id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {isExpanded && (
                  <CardContent className="pt-0 space-y-2">
                    <div className="text-xs text-muted-foreground border-t pt-2">
                      Historique des heures :
                    </div>
                    {empTimesheets.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Aucune heure enregistrée</p>
                    ) : (
                      empTimesheets.map((ts) => (
                        <div key={ts.id} className="flex justify-between items-center text-sm border-b pb-2">
                          <div>
                            <div className="font-medium">
                              {new Date(ts.date).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {ts.hours}h × {employee.hourlyRate}€ = {(ts.hours * employee.hourlyRate).toFixed(2)}€
                            </div>
                          </div>
                          {ts.status === 'due' ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleMarkAsPaid(ts.id)}
                            >
                              Payer
                            </Button>
                          ) : (
                            <span className="text-xs text-success">Payé</span>
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}

          {employees.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Aucun employé enregistré
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'employé ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'employé et toutes ses heures seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MobileNav />
    </div>
  );
};

export default Employees;
