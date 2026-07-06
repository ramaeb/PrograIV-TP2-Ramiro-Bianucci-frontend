import { Component, inject, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Toast } from '../../utils/sweetAlert';
import { forkJoin } from 'rxjs'; // 🚀 ¡CLAVE! Para unir las 3 peticiones en paralelo

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

  // 🚀 URL base apuntando a tu backend de Render
  private apiUrl = 'https://prograiv-tp2-ramiro-bianucci-backend.onrender.com/estadisticas';

  fechaInicio: string = '';
  fechaFin: string = '';
  cargando: boolean = false;
  fechaMaxima: string = ''; // 🚀 Variable para el límite max
  @ViewChild('barChartCanvas') barChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutChartCanvas') doughnutChartCanvas!: ElementRef<HTMLCanvasElement>;

  chartBar: any;
  chartLine: any;
  chartDoughnut: any;

  ngOnInit(): void {
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setDate(hoy.getDate() - 30);

    this.fechaFin = hoy.toISOString().split('T')[0];
    this.fechaInicio = haceUnMes.toISOString().split('T')[0];

    setTimeout(() => this.consultarEstadisticas(), 150);
    // Formato YYYY-MM-DD requerido por el input date
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

    // 🚀 Mapeamos los nombres de los parámetros tal cual los pide tu FiltroFechaDto de NestJS
    const params = { fechaInicio: this.fechaInicio, fechaFin: this.fechaFin };

    // 🚀 Creamos las 3 peticiones HTTP separadas apuntando a los endpoints del controlador
    const peticionPosts = this.http.get<any[]>(`${this.apiUrl}/posts-por-usuario`, { params });
    const peticionComentarios = this.http.get<any[]>(`${this.apiUrl}/comentarios-totales`, { params });
    const peticionImpacto = this.http.get<any[]>(`${this.apiUrl}/comentarios-por-post`, { params });

    // 🚀 Ejecutamos en paralelo para cumplir con las rutas individuales del backend
    forkJoin([peticionPosts, peticionComentarios, peticionImpacto]).subscribe({
      next: ([resPosts, resComentarios, resImpacto]) => {
        
        // 📊 1. Gráfico de Barras: Publicaciones por Usuario
        if (this.chartBar) this.chartBar.destroy();
        this.chartBar = new Chart(this.barChartCanvas.nativeElement, {
          type: 'bar',
          data: {
            // Ajustá '_id' o 'username' según el formato exacto que devuelva tu agregación de Mongo
            labels: resPosts.map((u: any) => u._id || 'Anónimo'), 
            datasets: [{
              label: 'Publicaciones por Usuario',
              data: resPosts.map((u: any) => u.cantidad),
              backgroundColor: '#0d6efd'
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });

        // 📈 2. Gráfico de Líneas: Evolución de Comentarios
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

        // 🍩 3. Gráfico de Dona: Impacto por Publicación
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