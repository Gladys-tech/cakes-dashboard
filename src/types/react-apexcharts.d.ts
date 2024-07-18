declare module 'react-apexcharts' {
    import { Component } from 'react';
    import { ApexOptions } from 'apexcharts';
  
    export interface ChartProps {
      options: ApexOptions;
      series: ApexAxisChartSeries | ApexNonAxisChartSeries;
      type: 'line' | 'area' | 'bar' | 'histogram' | 'pie' | 'donut' | 'radialBar' | 'scatter' | 'bubble' | 'heatmap' | 'candlestick' | 'radar' | 'polarArea' | 'rangeBar';
      height?: string | number;
      width?: string | number;
    }
  
    class Chart extends Component<ChartProps> {}
  
    export default Chart;
  }
  