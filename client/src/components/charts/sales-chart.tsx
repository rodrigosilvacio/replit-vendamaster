import { useEffect, useRef } from "react";

interface SalesChartProps {
  data: Array<{ date: string; total: number }>;
}

export default function SalesChart({ data }: SalesChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;

    // Import Chart.js dynamically
    import('chart.js/auto').then((Chart) => {
      const ctx = canvasRef.current!.getContext('2d');
      
      // Destroy existing chart if it exists
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      // Prepare data
      const labels = data.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit' 
        });
      });

      const values = data.map(item => item.total);

      chartRef.current = new Chart.default(ctx!, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Vendas',
            data: values,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                  }).format(value as number);
                }
              }
            }
          },
          elements: {
            point: {
              radius: 4,
              hoverRadius: 6,
            }
          }
        }
      });
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data]);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        <p>Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <div className="relative h-48">
      <canvas ref={canvasRef} />
    </div>
  );
}
