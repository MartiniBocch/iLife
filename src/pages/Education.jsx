"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BookOpen, Star, FolderOpen, Link as LinkIcon, Edit2 } from "lucide-react";
import Project from "@/entities/Project";
import useAppLevelAuth from "@/hooks/useAppLevelAuth";
import { Button } from "@/components/ui/button";

export default function EducationPage() {
  const { isLoggedIn } = useAppLevelAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchProjects = async () => {
      try {
        const data = await Project.list("deadline:asc");
        setProjects(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [isLoggedIn]);

  if (!isLoggedIn) return null;

  const exams = projects.filter(p => p.type === 'exam');
  const portfolio = projects.filter(p => p.type === 'portfolio');

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-12">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-primary" />
          Education Hub
        </h1>
        <p className="text-muted-foreground text-lg">Manage your studies, exams, and build your portfolio.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Exams & Study */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Exams & Studies</h2>
            </div>
          </div>
          <div className="grid gap-4">
            {exams.map((exam, i) => (
              <Card key={i} className="bg-white/70 backdrop-blur-md border-white/50 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-secondary">
                  <div className="h-full bg-primary" style={{ width: `${exam.progress || 0}%` }} />
                </div>
                <CardHeader className="pb-3 pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{exam.title}</CardTitle>
                      <div className="text-sm font-medium text-muted-foreground mt-1 capitalize">Status: {exam.status}</div>
                    </div>
                    <Badge variant={exam.status === 'completed' ? 'secondary' : 'default'} className="bg-primary hover:bg-primary/90 text-white">
                      {exam.deadline}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{exam.progress || 0}%</span>
                    </div>
                    {exam.trackingNotes && (
                      <p className="text-sm p-3 bg-secondary/30 rounded-xl mt-3">{exam.trackingNotes}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {exams.length === 0 && <div className="p-8 text-center text-muted-foreground border-2 border-dashed border-border rounded-2xl">No upcoming exams. Ask your assistant to add one!</div>}
          </div>
        </div>

        {/* Portfolio & Projects */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <Star className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Portfolio Projects</h2>
          </div>
          <div className="grid gap-4">
            {portfolio.map((proj, i) => (
              <Card key={i} className="bg-white/70 backdrop-blur-md border-white/50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-secondary">
                  <div className="h-full bg-primary" style={{ width: `${proj.progress || 0}%` }} />
                </div>
                <CardHeader className="pb-3 pt-6">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{proj.title}</CardTitle>
                    <FolderOpen className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardDescription className="text-primary font-medium">{proj.deadline}</CardDescription>
                </CardHeader>
                <CardContent>
                  {proj.skills && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {proj.skills.split(',').map((skill, j) => (
                        <span key={j} className="text-xs px-2 py-1 bg-secondary rounded-md font-medium text-secondary-foreground">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  {proj.trackingNotes && (
                    <p className="text-sm text-muted-foreground mb-3">{proj.trackingNotes}</p>
                  )}
                  {proj.url && (
                    <a href={proj.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                      <LinkIcon className="h-3 w-3 mr-1" /> View Project Link
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
            {portfolio.length === 0 && <div className="p-8 text-center text-muted-foreground border-2 border-dashed border-border rounded-2xl">Start building your portfolio! Ask your assistant to log a project.</div>}
          </div>
        </div>

      </div>
    </div>
  );
}