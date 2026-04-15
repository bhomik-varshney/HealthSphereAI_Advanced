import { Dumbbell, Target, Activity, Heart, Trophy, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getTrainerStatus, startTrainer, stopTrainer } from "@/services/api";

const workoutCategories = [
  {
    title: "Cardio",
    description: "Improve heart health and endurance",
    icon: Heart,
    color: "bg-destructive/10 text-destructive",
    exercises: ["Running", "Cycling", "Swimming"],
  },
  {
    title: "Strength",
    description: "Build muscle and increase power",
    icon: Dumbbell,
    color: "bg-primary/10 text-primary",
    exercises: ["Weight Training", "Resistance Bands", "Bodyweight"],
  },
  {
    title: "Flexibility",
    description: "Enhance mobility and prevent injury",
    icon: Activity,
    color: "bg-success/10 text-success",
    exercises: ["Yoga", "Stretching", "Pilates"],
  },
  {
    title: "HIIT",
    description: "High-intensity interval training",
    icon: Target,
    color: "bg-warning/10 text-warning",
    exercises: ["Burpees", "Jump Squats", "Mountain Climbers"],
  },
];

const weeklyProgress = [
  { day: "Mon", completed: true },
  { day: "Tue", completed: true },
  { day: "Wed", completed: true },
  { day: "Thu", completed: false },
  { day: "Fri", completed: false },
  { day: "Sat", completed: false },
  { day: "Sun", completed: false },
];

export default function Fitness() {
  const completedDays = weeklyProgress.filter((d) => d.completed).length;
  const progressPercent = (completedDays / weeklyProgress.length) * 100;
  const [trainerRunning, setTrainerRunning] = useState(false);
  const [trainerPid, setTrainerPid] = useState<number | null>(null);
  const [trainerMessage, setTrainerMessage] = useState("Checking trainer status...");
  const [trainerLoading, setTrainerLoading] = useState(false);

  const refreshTrainerStatus = async () => {
    try {
      const status = await getTrainerStatus();
      setTrainerRunning(status.running);
      setTrainerPid(status.pid ?? null);
      setTrainerMessage(status.message);
    } catch (error) {
      setTrainerMessage(error instanceof Error ? error.message : "Could not fetch trainer status");
    }
  };

  useEffect(() => {
    refreshTrainerStatus();
  }, []);

  const handleStartTrainer = async () => {
    setTrainerLoading(true);
    try {
      const status = await startTrainer();
      setTrainerRunning(status.running);
      setTrainerPid(status.pid ?? null);
      setTrainerMessage(`${status.message}. A trainer window should open on your system.`);
    } catch (error) {
      setTrainerMessage(error instanceof Error ? error.message : "Could not start AI Gym Trainer");
    } finally {
      setTrainerLoading(false);
    }
  };

  const handleStopTrainer = async () => {
    setTrainerLoading(true);
    try {
      const status = await stopTrainer();
      setTrainerRunning(status.running);
      setTrainerPid(status.pid ?? null);
      setTrainerMessage(status.message);
    } catch (error) {
      setTrainerMessage(error instanceof Error ? error.message : "Could not stop AI Gym Trainer");
    } finally {
      setTrainerLoading(false);
    }
  };

  const handleWorkoutClick = async () => {
    if (trainerRunning) {
      await handleStopTrainer();
    } else {
      await handleStartTrainer();
    }
  };

  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
          Fitness Tracker
        </h1>
        <p className="mt-2 text-muted-foreground">
          Track your workouts and achieve your fitness goals
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Weekly Progress */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    This Week
                  </CardTitle>
                  <CardDescription>
                    {completedDays} of {weeklyProgress.length} days completed
                  </CardDescription>
                </div>
                <Trophy className="h-8 w-8 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={progressPercent} className="mb-4 h-3" />
              <div className="flex justify-between">
                {weeklyProgress.map((day) => (
                  <div key={day.day} className="flex flex-col items-center gap-2">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${
                        day.completed
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {day.day.charAt(0)}
                    </div>
                    <span className="text-xs text-muted-foreground">{day.day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Workout Categories */}
          <div>
            <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
              Workout Categories
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {workoutCategories.map((category) => (
                <Card key={category.title} variant="interactive">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${category.color}`}
                      >
                        <category.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <CardDescription className="text-xs">
                          {category.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {category.exercises.map((exercise) => (
                        <span
                          key={exercise}
                          className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                        >
                          {exercise}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card variant="gradient">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Workouts this week</span>
                <span className="font-semibold text-foreground">{completedDays}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current streak</span>
                <span className="font-semibold text-foreground">3 days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Calories burned</span>
                <span className="font-semibold text-foreground">1,250</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total time</span>
                <span className="font-semibold text-foreground">2h 45m</span>
              </div>
            </CardContent>
          </Card>

          {/* Start Workout CTA */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Dumbbell className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 font-display font-semibold text-foreground">
                Ready to work out?
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Start a quick workout session now
              </p>
              <Button
                variant="hero"
                className="w-full"
                onClick={handleWorkoutClick}
                disabled={trainerLoading}
              >
                {trainerLoading ? "Please wait..." : trainerRunning ? "Stop Workout" : "Start Workout"}
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">
                {trainerMessage}
                {trainerPid ? ` (PID: ${trainerPid})` : ""}
              </p>
              <Button
                variant="ghost"
                className="mt-2 w-full"
                onClick={refreshTrainerStatus}
                disabled={trainerLoading}
              >
                Refresh Status
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
