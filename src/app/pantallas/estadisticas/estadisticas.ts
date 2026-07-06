import { Component, inject, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Toast } from '../../utils/sweetAlert';
import { forkJoin } from 'rxjs'; 

import { 
  Chart, 
  CategoryScale, 
  LinearScale, 
  BarController, 
  LineController, 
  PieController, 
  DoughnutController, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

Chart.register(
  CategoryScale,
  LinearScale,
  BarController,
  LineController,
  PieController,
  DoughnutController,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-dashboard-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estadisticas.html',
  styleUrls: ['./estadisticas.css']
})
export class DashboardEstadisticas implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  private apiUrl = 'https://prograiv-tp2-ramiro-bianucci-backend.onrender.com/estadisticas';

  fechaInicio: string = '';
  fechaFin: string = '';
  cargando: boolean = false;
  fechaMaxima: string = ''; 

  // Referencias Viejas
  @ViewChild('barChartCanvas') barChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutChartCanvas') doughnutChartCanvas!: ElementRef<HTMLCanvasElement>;

  // 🚀 Referencias Nuevas (Sprint 5)
  @ViewChild('ingresosChartCanvas') ingresosChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('visitasChartCanvas') visitasChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('likesChartCanvas') likesChartCanvas!: ElementRef<HTMLCanvasElement>;

  chartBar: any;
  chartLine: any;
  chartDoughnut: any;

  // 🚀 Gráficos Nuevos
  chartIngresos: any;
  chartVisitas: any;
  chartLikes: any;

  ngOnInit(): void {
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setDate(hoy.getDate() - 30);

    this.fechaMaxima = hoy.toISOString().split('T')[0];
    this.fechaFin = hoy.toISOString().split('T')[0];
    this.fechaInicio = haceUnMes.toISOString().split('T')[0];

    setTimeout(() => this.consultarEstadisticas(), 150);
  }

  consultarEstadisticas(): void {
    if (!this.fechaInicio || !this.fechaFin) {
      Toast.fire({ icon: 'warning', title: 'Por favor, selecciona ambas fechas.' });
      return;
    }

    this.cargando = true;
    this.cdr.detectChanges();

    const params = { fechaInicio: this.fechaInicio, fechaFin: this.fechaFin };


    const peticionPosts = this.http.get<any[]>(`${this.apiUrl}/posts-por-usuario`, { params });
    const peticionComentarios = this.http.get<any[]>(`${this.apiUrl}/comentarios-totales`, { params });
    const peticionImpacto = this.http.get<any[]>(`${this.apiUrl}/comentarios-por-post`, { params });

    const peticionIngresos = this.http.get<any[]>(`${this.apiUrl}/ingresos-usuario`, { params });
    const peticionVisitas = this.http.get<any[]>(`${this.apiUrl}/visitas-perfil`, { params });
    const peticionLikes = this.http.get<any[]>(`${this.apiUrl}/likes-por-dia`, { params });

    // Unimos las 6 en paralelo
    forkJoin([
      peticionPosts, peticionComentarios, peticionImpacto, 
      peticionIngresos, peticionVisitas, peticionLikes
    ]).subscribe({
      next: ([resPosts, resComentarios, resImpacto, resIngresos, resVisitas, resLikes]) => {
        
        // --- GRÁFICOS VIEJOS ---
        
        if (this.chartBar) this.chartBar.destroy();
        this.chartBar = new Chart(this.barChartCanvas.nativeElement, {
          type: 'bar',
          data: {
            labels: resPosts.map((u: any) => u._id || 'Anónimo'), 
            datasets: [{
              label: 'Publicaciones por Usuario',
              data: resPosts.map((u: any) => u.cantidad),
              backgroundColor: '#0d6efd'
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });

        if (this.chartLine) this.chartLine.destroy();
        this.chartLine = new Chart(this.lineChartCanvas.nativeElement, {
          type: 'line',
          data: {
            labels: resComentarios.map((c: any) => c._id),
            datasets: [{
              label: 'Comentarios en el periodo',
              data: resComentarios.map((c: any) => c.cantidad),
              borderColor: '#198754',
              backgroundColor: 'rgba(25, 135, 84, 0.1)',
              tension: 0.3,
              fill: true
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });

        if (this.chartDoughnut) this.chartDoughnut.destroy();
        this.chartDoughnut = new Chart(this.doughnutChartCanvas.nativeElement, {
          type: 'doughnut',
          data: {
            labels: resImpacto.map((p: any) => p.titulo ? (p.titulo.substring(0, 15) + '...') : 'Post'),
            datasets: [{
              data: resImpacto.map((p: any) => p.cantidadComentarios),
              backgroundColor: ['#ffc107', '#dc3545', '#0dcaf0', '#6610f2', '#fd7e14']
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });

        

        if (this.chartIngresos) this.chartIngresos.destroy();
        this.chartIngresos = new Chart(this.ingresosChartCanvas.nativeElement, {
          type: 'bar',
          data: {
            labels: resIngresos.map((u: any) => u._id ? '@' + u._id : 'Anónimo'),
            datasets: [{
              label: 'Cantidad de Logins',
              data: resIngresos.map((u: any) => u.cantidad),
              backgroundColor: '#6f42c1', // Morado
              borderRadius: 4
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });

        // 2. Evolución de Likes - Línea
        if (this.chartLikes) this.chartLikes.destroy();
        this.chartLikes = new Chart(this.likesChartCanvas.nativeElement, {
          type: 'line',
          data: {
            labels: resLikes.map((l: any) => l._id),
            datasets: [{
              label: 'Likes Otorgados',
              data: resLikes.map((l: any) => l.cantidad),
              borderColor: '#dc3545', // Rojo
              backgroundColor: 'rgba(220, 53, 69, 0.15)',
              tension: 0.3,
              fill: true,
              pointBackgroundColor: '#dc3545'
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });

        // 3. Visitas a Perfiles - Dona
        if (this.chartVisitas) this.chartVisitas.destroy();
        this.chartVisitas = new Chart(this.visitasChartCanvas.nativeElement, {
          type: 'doughnut',
          data: {
            labels: resVisitas.map((v: any) => v.username ? '@' + v.username : 'Perfil'),
            datasets: [{
              data: resVisitas.map((v: any) => v.cantidad),
              backgroundColor: ['#20c997', '#0dcaf0', '#ffc107', '#fd7e14', '#e83e8c']
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });

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