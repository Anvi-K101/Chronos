import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { PageContainer, SectionHeader, Card } from '../components/ui/Controls';
import { StorageService } from '../services/storage';
import { useAuth } from '../services/authContext';

// --- Reusable Chart Component ---
const LineChart = ({ data, color, height = 150, domain = [1, 10] }: { data: number[], color: string, height?: number, domain?: [number, number] }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const w = svgRef.current.clientWidth;
    const h = height;
    const padding = 20;

    const xScale = d3.scaleLinear().domain([0, data.length - 1]).range([padding, w - padding]);
    const yScale = d3.scaleLinear().domain(domain).range([h - padding, padding]);

    const line = d3.line<number>()
      .x((d, i) => xScale(i))
      .y(d => yScale(d || 0))
      .curve(d3.curveMonotoneX); // Smooth curves

    // Area fill
    const area = d3.area<number>()
      .x((d, i) => xScale(i))
      .y0(h - padding)
      .y1(d => yScale(d || 0))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", color)
      .attr("fill-opacity", 0.1)
      .attr("d", area);

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .attr("d", line);

    // Dots
    svg.selectAll("circle")
       .data(data)
       .enter()
       .append("circle")
       .attr("cx", (d, i) => xScale(i))
       .attr("cy", d => yScale(d || 0))
       .attr("r", 3)
       .attr("fill", "white")
       .attr("stroke", color);

  }, [data, color, height]);

  return <svg ref={svgRef} className="w-full" style={{ height }} />;
};

export const Analytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({
    moods: [],
    anxiety: [],
    sleep: [],
    work: [],
    totalEntries: 0
  });

  useEffect(() => {
    // Load all data
    const data = StorageService.loadLocal(); // In a real app we'd fetch range from FireStore
    const entries = Object.values(data.entries).sort((a, b) => a.id.localeCompare(b.id));

    setStats({
      moods: entries.map(e => e.state.mood || 5),
      anxiety: entries.map(e => e.state.anxiety || 1),
      sleep: entries.map(e => e.effort.sleepDuration || 0),
      work: entries.map(e => e.effort.workHours || 0),
      totalEntries: entries.length
    });
  }, [user]);

  if (stats.totalEntries === 0) {
     return (
        <PageContainer>
           <SectionHeader title="Analytics" subtitle="2026 Overview" />
           <div className="text-center py-20 text-gray-400">
              <p>No data recorded yet.</p>
           </div>
        </PageContainer>
     );
  }

  return (
    <PageContainer>
      <SectionHeader title="Life Patterns" subtitle={`Analysis of ${stats.totalEntries} days`} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
         <Card title="Emotional Baseline">
            <div className="mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Mood Trend</div>
            <LineChart data={stats.moods} color="#65a30d" />
         </Card>
         <Card title="Internal Tension">
            <div className="mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Anxiety Trend</div>
            <LineChart data={stats.anxiety} color="#ea580c" />
         </Card>
      </div>

      <Card title="Rest & Recovery">
         <div className="flex justify-between items-end mb-4">
            <div>
               <div className="text-3xl font-serif text-ink font-bold">{d3.mean(stats.sleep)?.toFixed(1)}h</div>
               <div className="text-xs text-gray-400 font-bold uppercase">Avg Sleep</div>
            </div>
         </div>
         <LineChart data={stats.sleep} color="#2563eb" height={100} domain={[4, 12]} />
      </Card>

      <Card title="Deep Work Volume">
          <div className="flex justify-between items-end mb-4">
            <div>
               <div className="text-3xl font-serif text-ink font-bold">{d3.sum(stats.work)?.toFixed(1)}h</div>
               <div className="text-xs text-gray-400 font-bold uppercase">Total Hours</div>
            </div>
         </div>
         <LineChart data={stats.work} color="#475569" height={100} domain={[0, 12]} />
      </Card>
    </PageContainer>
  );
};