import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface TreeOfLifeProps {
  entryCount: number;
  activityLevel: number;
  stats?: {
    avgMood: number;
    totalCreative: number;
    totalStress: number;
    totalClarity: number;
  }
}

export const TreeOfLife: React.FC<TreeOfLifeProps> = ({ 
  entryCount, 
  activityLevel, 
  stats = { avgMood: 5, totalCreative: 0, totalStress: 0, totalClarity: 0 } 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    
    // Config based on data
    const growthStage = Math.min(Math.log(Math.max(entryCount, 1) + 1) * 3 + 3, 16); 
    const moodColor = d3.interpolateLab("#a8a29e", "#4d7c0f")(stats.avgMood / 10);
    const stressFactor = Math.min(stats.totalStress / 50, 1); // 0 to 1
    const waterLevel = Math.min(stats.totalClarity * 2, 100); 
    
    // Background Elements (Water/Sun)
    const defs = svg.append("defs");
    
    // Ground Gradient
    const groundGrad = defs.append("linearGradient").attr("id", "groundGrad").attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
    groundGrad.append("stop").attr("offset", "0%").attr("stop-color", "#fdfbf7").attr("stop-opacity", 0);
    groundGrad.append("stop").attr("offset", "50%").attr("stop-color", "#e7e5e4").attr("stop-opacity", 0.5);

    // Draw Ground
    svg.append("rect")
       .attr("x", 0)
       .attr("y", height - 60)
       .attr("width", width)
       .attr("height", 60)
       .attr("fill", "url(#groundGrad)");

    // Water (Mental Clarity)
    if (waterLevel > 10) {
      svg.append("path")
         .attr("d", `M 0 ${height-30} Q ${width/2} ${height-40-waterLevel/4} ${width} ${height-30} V ${height} H 0 Z`)
         .attr("fill", "#e0f2fe")
         .attr("opacity", 0.6);
    }

    // Recursive Tree Function
    const drawTree = (selection: any, len: number, angle: number, branchWidth: number, depth: number) => {
        if (depth <= 0) {
            // Foliage
            if (len < 10) {
                selection.append("circle")
                    .attr("r", Math.random() * 3 + 2)
                    .attr("fill", moodColor)
                    .attr("opacity", 0.6 + Math.random() * 0.4);
            }
            return;
        }

        // Branch Style (Darker if stressed)
        const branchColor = d3.interpolateLab("#57534e", "#292524")(stressFactor);
        
        selection.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", -len)
            .attr("stroke", branchColor)
            .attr("stroke-width", branchWidth)
            .attr("stroke-linecap", "round");

        const endOfBranch = selection.append("g").attr("transform", `translate(0, ${-len})`);

        // Decay Elements (Skulls/Knots) if high stress
        if (stressFactor > 0.5 && Math.random() > 0.9 && depth < 3) {
           endOfBranch.append("circle")
              .attr("r", branchWidth * 1.5)
              .attr("fill", "#44403c");
        }

        const branchCount = Math.random() > 0.35 ? 2 : 3;
        
        for (let i = 0; i < branchCount; i++) {
           const rotate = (Math.random() * 60 - 30) + (i === 0 ? -20 : 20);
           const shorten = 0.75 + Math.random() * 0.1;
           const thin = 0.7;
           
           endOfBranch.append("g")
              .attr("transform", `rotate(${rotate})`)
              .call((s: any) => drawTree(s, len * shorten, angle, branchWidth * thin, depth - 1));
        }
    };

    const rootGroup = svg.append("g").attr("transform", `translate(${width/2}, ${height - 40})`);
    
    // Draw Main Tree
    drawTree(rootGroup, height / 5, 0, growthStage / 1.2, Math.ceil(growthStage / 2));

    // Birds (Creative Hours)
    const birdCount = Math.min(Math.floor(stats.totalCreative / 5), 15);
    for(let i=0; i<birdCount; i++) {
        const bx = Math.random() * width;
        const by = Math.random() * (height/2);
        svg.append("text")
           .attr("x", bx)
           .attr("y", by)
           .text("~")
           .attr("font-size", 10 + Math.random() * 10)
           .attr("fill", "#78716c")
           .attr("opacity", 0.6);
    }

  }, [entryCount, activityLevel, stats]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none mix-blend-multiply transition-opacity duration-1000">
        <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};