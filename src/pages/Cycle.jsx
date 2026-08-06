"use client";

import React, { useState, useEffect } from "react";
import HealthLog from "@/entities/HealthLog";
import { Droplets, Activity, Plus } from "lucide-react";
import useAppLevelAuth from "@/hooks/useAppLevelAuth";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast, { Toaster } from 'react-hot-toast';

export default function CyclePage() {
  const { isLoggedIn } = useAppLevelAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Today's Form States
  const [activeLogId, setActiveLogId] = useState<string | null>(null);
  const [cyclePhase, setCyclePhase] = useState("none");
  const [cycleStart, setCycleStart] = useState(false);
  const [bleedingEnd, setBleedingEnd] = useState(false);
  const [overallFeeling, setOverallFeeling] = useState("");
  const [physicalSymptoms, setPhysicalSymptoms] = useState("");

  useEffect(() => {
    if (!isLoggedIn) return;
    loadData();
  }, [isLoggedIn]);

  const loadData = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const data = await HealthLog.list("date:desc");
      setLogs(data || []);

      const todaysLog = (data || []).find(l => l.date === today);
      if (todaysLog) {
        setActiveLogId(todaysLog.id);
        setCyclePhase(todaysLog.cyclePhase || "none");
        setCycleStart(todaysLog.cycleStart || false);
        setBleedingEnd(todaysLog.bleedingEnd || false);
        setOverallFeeling(todaysLog.overallFeeling || "");
        setPhysicalSymptoms(todaysLog.physicalSymptoms || "");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const data = {
      date: today, cyclePhase, cycleStart, bleedingEnd, overallFeeling, physicalSymptoms
    };
    
    try {
      if (activeLogId) {
        await HealthLog.update(activeLogId, data);
      } else {
        const newLog = await HealthLog.create(data);
        setActiveLogId(newLog.id);
      }
      toast.success("Cycle data saved successfully!");
      loadData();
    } catch (e) {
      toast.error("Failed to save data.");
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto w-full space-y-8">
      <Toaster position="bottom-center" />
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-3">
          <Droplets className="h-8 w-8 text-primary" />
          Cycle & Physical
        </h1>
        <p className="text-muted-foreground text-lg">Track your cycle history and physical well-being.</p>
      </div>

      <Card className="bg-white/70 backdrop-blur-md border-white/50 shadow-md h-fit">
        <CardHeader>
          <CardTitle>Log Today's Cycle</CardTitle>
          <CardDescription>Keep track of how you are feeling physically today.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-6 border-b pb-4">
            <div className="flex items-center space-x-3 bg-secondary/50 p-3 rounded-xl flex-1">
              <Checkbox id="start" checked={cycleStart} onCheckedChange={(c) => setCycleStart(!!c)} className="w-5 h-5 rounded-full" />
              <label htmlFor="start" className="text-base font-medium cursor-pointer">Start of Cycle</label>
            </div>
            <div className="flex items-center space-x-3 bg-secondary/50 p-3 rounded-xl flex-1">
              <Checkbox id="end" checked={bleedingEnd} onCheckedChange={(c) => setBleedingEnd(!!c)} className="w-5 h-5 rounded-full" />
              <label htmlFor="end" className="text-base font-medium cursor-pointer">End of Bleeding</label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cycle Phase</label>
              <Select value={cyclePhase} onValueChange={setCyclePhase}>
                <SelectTrigger className="bg-white h-12"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not tracking / N/A</SelectItem>
                  <SelectItem value="menstrual">Menstrual</SelectItem>
                  <SelectItem value="follicular">Follicular</SelectItem>
                  <SelectItem value="ovulation">Ovulation</SelectItem>
                  <SelectItem value="luteal">Luteal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Overall Feeling (Cycle)</label>
              <Input placeholder="Bloated, energetic, emotional..." value={overallFeeling} onChange={e => setOverallFeeling(e.target.value)} className="bg-white h-12" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2"><Activity className="w-4 h-4"/> Physical Feelings / Symptoms</label>
            <Input placeholder="Headaches, aches, tired..." value={physicalSymptoms} onChange={e => setPhysicalSymptoms(e.target.value)} className="bg-white h-12" />
          </div>

          <div className="flex justify-center pt-4">
            <Button onClick={handleSave} size="lg" className="px-8 shadow-lg shadow-primary/20 rounded-full">Save Today's Log</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold border-b pb-2">History</h2>
        {logs.map((log, i) => (
          <div key={i} className="bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-lg">{log.date}</div>
              <div className="flex gap-2 mt-1">
                {log.cycleStart && <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-md font-medium">Cycle Started</span>}
                {log.bleedingEnd && <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-md font-medium">Bleeding Ended</span>}
                {log.cyclePhase && log.cyclePhase !== 'none' && <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md font-medium capitalize">{log.cyclePhase}</span>}
              </div>
            </div>
            <div className="text-sm text-muted-foreground flex-1">
              {log.physicalSymptoms && <div><strong className="text-foreground">Physical:</strong> {log.physicalSymptoms}</div>}
              {log.overallFeeling && <div><strong className="text-foreground">Feeling:</strong> {log.overallFeeling}</div>}
            </div>
          </div>
        ))}
        {logs.length === 0 && <p className="text-muted-foreground text-center py-8">No previous logs found.</p>}
      </div>

    </div>
  );
}