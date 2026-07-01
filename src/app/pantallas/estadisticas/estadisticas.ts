import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { Toast } from '../../utils/sweetAlert';

@Component({
  selector: 'app-dashboard-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './estadisticas.html',
  styleUrls: ['./estadisticas.css']
})
export class DashboardEstadisticas implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  private apiUrl = 'https://prograiv-tp2-ramiro-bianucci-backend.onrender.com/api/estadisticas';

  // Filtros globales de fechas para los lapsos de tiempo
  fechaInicio: string = '';
  fechaFin: string = '';

  cargando: boolean = false;

  // --- CONFIGURACIÓN GRÁFICO 1: Publicaciones por Usuario (Tipo: Barras) ---
  public barChartType: ChartType = 'bar';
  public barChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Publicaciones por Usuario', backgroundColor: '#0d6efd' }]
  };
  public barChartOptions: ChartConfiguration['options'] = { responsive: true };

  // --- CONFIGURACIÓN GRÁFICO 2: Comentarios en el Tiempo (Tipo: Líneas) ---
  public lineChartType: ChartType = 'line';
  public lineChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Comentarios en el periodo', borderColor: '#198754', tension: 0.3, fill: false }]
  };
  public lineChartOptions: ChartConfiguration['options'] = { responsive: true };

  // --- CONFIGURACIÓN GRÁFICO 3: Comentarios por Publicación (Tipo: Dona/Torta) ---
  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{ data: [], backgroundColor: ['#ffc107', '#dc3545', '#0dcaf0', '#6610f2', '#fd7e14'] }]
  };
  public doughnutChartOptions: ChartConfiguration['options'] = { responsive: true };

  ngOnInit(): void {
    // Inicializar el lapso de tiempo con los últimos 30 días por defecto
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setDate(hoy.getDate() - 30);

    this.fechaFin = hoy.toISOString().split('T')[0];
    this.fechaInicio = haceUnMes.toISOString().split('T')[0];

    this.consultarEstadisticas();
  }

  // Carga o actualiza todos los gráficos mandando el lapso de tiempo al backend
  consultarEstadisticas(): void {
    if (!this.fechaInicio || !this.fechaFin) {
      Toast.fire({ icon: 'warning', title: 'Por favor, selecciona ambas fechas.' });
      return;
    }

    this.cargando = true;
    this.cdr.detectChanges();

    // Enviamos el lapso de tiempo elegido como Query Params al backend
    const params = { desde: this.fechaInicio, hasta: this.fechaFin };

    this.http.get<any>(this.apiUrl, { params }).subscribe({
      next: (res) => {
        // 1. Mapeo Gráfico de Barras: Publicaciones por Usuario
        this.barChartData.labels = res.publicacionesPorUsuario.map((u: any) => u.username);
        this.barChartData.datasets[0].data = res.publicacionesPorUsuario.map((u: any) => u.cantidad);

        // 2. Mapeo Gráfico de Líneas: Historial de Comentarios por día
        this.lineChartData.labels = res.comentariosPorDia.map((c: any) => c.fecha);
        this.lineChartData.datasets[0].data = res.comentariosPorDia.map((c: any) => c.cantidad);

        // 3. Mapeo Gráfico de Dona: Comentarios por Publicación (Títulos cortos)
        this.doughnutChartData.labels = res.comentariosPorPost.map((p: any) => p.tituloCorto);
        this.doughnutChartData.datasets[0].data = res.comentariosPorPost.map((p: any) => p.cantidad);

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al traer estadísticas:', err);
        this.cargando = false;
        this.cdr.detectChanges();
        Toast.fire({ icon: 'error', title: 'Error al procesar las estadísticas.' });
      }
    });
  }
}