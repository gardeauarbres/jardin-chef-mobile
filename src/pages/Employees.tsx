import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Euro, Clock, TrendingUp, Trash2, FileSpreadsheet, FileText, Upload, CheckSquare, Square, Download } from 'lucide-react';
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
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { exportEmployees } from '@/lib/dataExport';
import { importEmployees } from '@/lib/dataImport';
import { exportEmployeePayrollToPDF } from '@/lib/pdfExport';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  hourly_rate: number;
  created_at: string;
}

interface Timesheet {
  id: string;
  employee_id: string;
  date: string;
  hours: number;
  status: string;
  paid_date: string | null;
  created_at: string;
}

const Employees = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddTimesheet, setShowAddTimesheet] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

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

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    fetchEmployees();
    fetchTimesheets();
  }, [user]);

  const fetchEmployees = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement des employés");
    } else {
      setEmployees(data || []);
    }
  };

  const fetchTimesheets = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('timesheets')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement des heures");
    } else {
      setTimesheets(data || []);
    }
  };

  const stats = useMemo(() => {
    const totalDue = timesheets
      .filter(t => t.status === 'due')
      .reduce((sum, t) => {
        const employee = employees.find(e => e.id === t.employee_id);
        return sum + (employee ? t.hours * employee.hourly_rate : 0);
      }, 0);

    const totalPaid = timesheets
      .filter(t => t.status === 'paid')
      .reduce((sum, t) => {
        const employee = employees.find(e => e.id === t.employee_id);
        return sum + (employee ? t.hours * employee.hourly_rate : 0);
      }, 0);

    const totalHours = timesheets.reduce((sum, t) => sum + t.hours, 0);

    return { totalDue, totalPaid, totalHours };
  }, [employees, timesheets]);

  const handleAddEmployee = async () => {
    if (!user || !newEmployee.firstName || !newEmployee.lastName || !newEmployee.hourlyRate) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    const { error } = await supabase
      .from('employees')
      .insert({
        user_id: user.id,
        first_name: newEmployee.firstName,
        last_name: newEmployee.lastName,
        hourly_rate: parseFloat(newEmployee.hourlyRate),
      });

    if (error) {
      toast.error("Erreur lors de l'ajout de l'employé");
    } else {
      toast.success('Employé ajouté');
      setNewEmployee({ firstName: '', lastName: '', hourlyRate: '' });
      setShowAddEmployee(false);
      fetchEmployees();
    }
  };

  const handleAddTimesheet = async () => {
    if (!user || !newTimesheet.employeeId || !newTimesheet.date || !newTimesheet.hours) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    const { error } = await supabase
      .from('timesheets')
      .insert({
        user_id: user.id,
        employee_id: newTimesheet.employeeId,
        date: newTimesheet.date,
        hours: parseFloat(newTimesheet.hours),
        status: 'due',
      });

    if (error) {
      toast.error("Erreur lors de l'enregistrement des heures");
    } else {
      toast.success('Heures enregistrées');
      setNewTimesheet({ employeeId: '', date: new Date().toISOString().split('T')[0], hours: '' });
      setShowAddTimesheet(false);
      fetchTimesheets();
    }
  };

  const handleMarkAsPaid = async (timesheetId: string) => {
    const { error } = await supabase
      .from('timesheets')
      .update({
        status: 'paid',
        paid_date: new Date().toISOString(),
      })
      .eq('id', timesheetId);

    if (error) {
      toast.error("Erreur lors de la mise à jour");
    } else {
      toast.success('Marqué comme payé');
      fetchTimesheets();
    }
  };

  const handleDeleteEmployee = (employeeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmployeeToDelete(employeeId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;

    // Delete all timesheets for this employee first
    const empTimesheets = timesheets.filter(t => t.employee_id === employeeToDelete);
    for (const ts of empTimesheets) {
      await supabase.from('timesheets').delete().eq('id', ts.id);
    }

    // Then delete the employee
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', employeeToDelete);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success('Employé supprimé');
      fetchEmployees();
      fetchTimesheets();
    }

    setDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  };

  const getEmployeeTimesheets = (employeeId: string) => {
    return timesheets.filter(t => t.employee_id === employeeId);
  };

  const getEmployeeStats = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return { totalHours: 0, totalDue: 0, totalPaid: 0 };

    const empTimesheets = getEmployeeTimesheets(employeeId);
    const totalHours = empTimesheets.reduce((sum, t) => sum + t.hours, 0);
    const totalDue = empTimesheets
      .filter(t => t.status === 'due')
      .reduce((sum, t) => sum + t.hours * employee.hourly_rate, 0);
    const totalPaid = empTimesheets
      .filter(t => t.status === 'paid')
      .reduce((sum, t) => sum + t.hours * employee.hourly_rate, 0);

    return { totalHours, totalDue, totalPaid };
  };

  // Gestion de la sélection
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      setSelectedEmployees(new Set());
    }
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    const newSelection = new Set(selectedEmployees);
    if (newSelection.has(employeeId)) {
      newSelection.delete(employeeId);
    } else {
      newSelection.add(employeeId);
    }
    setSelectedEmployees(newSelection);
  };

  const selectAllEmployees = () => {
    setSelectedEmployees(new Set(employees.map(e => e.id)));
  };

  const deselectAllEmployees = () => {
    setSelectedEmployees(new Set());
  };

  const handleExportSelected = (format: 'excel' | 'csv') => {
    if (selectedEmployees.size === 0) {
      toast.error('Veuillez sélectionner au moins un employé');
      return;
    }

    const selectedEmployeesData = employees.filter(e => selectedEmployees.has(e.id));
    try {
      if (format === 'excel') {
        exportEmployees(selectedEmployeesData, 'excel');
        toast.success(`${selectedEmployees.size} employé(s) exporté(s) en Excel`);
      } else {
        exportEmployees(selectedEmployeesData, 'csv');
        toast.success(`${selectedEmployees.size} employé(s) exporté(s) en CSV`);
      }
      setIsSelectMode(false);
      setSelectedEmployees(new Set());
    } catch (error) {
      console.error('Erreur export employés:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'export');
    }
  };

  const handleImportFile = async (file: File) => {
    if (!user) {
      toast.error('Vous devez être connecté pour importer');
      return;
    }

    if (!confirm(`Voulez-vous importer les données depuis "${file.name}" ?`)) {
      return;
    }

    try {
      await importEmployees(file, user.id);
      fetchEmployees();
      toast.success('Import réussi');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'import');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Employés</h1>
            <p className="text-sm opacity-90 mt-1">Gestion des heures</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="secondary">
                <FileSpreadsheet className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isSelectMode ? (
                <>
                  <DropdownMenuItem onClick={selectAllEmployees}>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Tout sélectionner
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={deselectAllEmployees}>
                    <Square className="h-4 w-4 mr-2" />
                    Tout désélectionner
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={toggleSelectMode}>
                    Annuler la sélection
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={toggleSelectMode}>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Mode sélection
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      try {
                        exportEmployees(employees, 'excel');
                        toast.success('Export Excel réussi');
                      } catch (error) {
                        console.error('Erreur export employés Excel:', error);
                        toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'export');
                      }
                    }}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Exporter tout en Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      try {
                        exportEmployees(employees, 'csv');
                        toast.success('Export CSV réussi');
                      } catch (error) {
                        console.error('Erreur export employés CSV:', error);
                        toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'export');
                      }
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Exporter tout en CSV
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.xlsx,.xls,.csv';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleImportFile(file);
                  };
                  input.click();
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Importer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Barre d'action pour la sélection */}
        {isSelectMode && selectedEmployees.size > 0 && (
          <Card className="bg-primary/10 border-primary">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedEmployees.size} employé{selectedEmployees.size !== 1 ? 's' : ''} sélectionné{selectedEmployees.size !== 1 ? 's' : ''}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportSelected('excel')}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportSelected('csv')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                      {emp.first_name} {emp.last_name}
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
                  className={`${isSelectMode ? '' : 'cursor-pointer'} overflow-visible`}
                  onClick={() => !isSelectMode && setSelectedEmployeeId(isExpanded ? '' : employee.id)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      {isSelectMode && (
                        <Checkbox
                          checked={selectedEmployees.has(employee.id)}
                          onCheckedChange={() => toggleEmployeeSelection(employee.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base">
                          {employee.first_name} {employee.last_name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{employee.hourly_rate}€/h</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 flex-shrink-0 z-10">
                      <div className="text-right">
                        <div className="text-sm font-medium">{stats.totalHours}h</div>
                        <div className="text-xs text-warning font-medium">{stats.totalDue}€ dû</div>
                      </div>
                      {isSelectMode ? (
                        <Checkbox
                          checked={selectedEmployees.has(employee.id)}
                          onCheckedChange={() => toggleEmployeeSelection(employee.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="default"
                            className="h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0 whitespace-nowrap"
                            onClick={(e) => {
                              e.stopPropagation();
                              exportEmployeePayrollToPDF({
                                id: employee.id,
                                first_name: employee.first_name,
                                last_name: employee.last_name,
                                hourly_rate: employee.hourly_rate,
                                timesheets: empTimesheets.map(ts => ({
                                  id: ts.id,
                                  date: ts.date,
                                  hours: ts.hours,
                                  status: ts.status,
                                  paid_date: ts.paid_date,
                                })),
                              });
                              toast.success('Fiche de paie générée');
                            }}
                            title="Télécharger la fiche de paie"
                          >
                            <Download className="h-4 w-4 mr-1.5" />
                            PDF
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="hover:bg-destructive hover:text-destructive-foreground transition-all h-8 w-8 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEmployee(employee.id, e);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                {isExpanded && (
                  <CardContent className="pt-0 space-y-2">
                    <div className="flex items-center justify-between border-t pt-2 pb-2">
                      <div className="text-xs text-muted-foreground">
                        Historique des heures :
                      </div>
                      <Button
                        size="sm"
                        variant="default"
                        className="h-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          exportEmployeePayrollToPDF({
                            id: employee.id,
                            first_name: employee.first_name,
                            last_name: employee.last_name,
                            hourly_rate: employee.hourly_rate,
                            timesheets: empTimesheets.map(ts => ({
                              id: ts.id,
                              date: ts.date,
                              hours: ts.hours,
                              status: ts.status,
                              paid_date: ts.paid_date,
                            })),
                          });
                          toast.success('Fiche de paie générée');
                        }}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Télécharger PDF
                      </Button>
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
                              {ts.hours}h × {employee.hourly_rate}€ = {(ts.hours * employee.hourly_rate).toFixed(2)}€
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
