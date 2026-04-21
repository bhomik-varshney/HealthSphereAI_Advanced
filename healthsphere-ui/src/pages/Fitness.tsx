import { Dumbbell, Target, Activity, Heart, Trophy, Calendar, Apple, Flame, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

      {/* Calorie Counter Promotion Section */}
      <div className="mt-10">
        <Card className="border-0 bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 shadow-xl overflow-hidden relative">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-teal-400 blur-3xl opacity-12 animate-pulse" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-emerald-400 blur-2xl opacity-12 animate-pulse" />
            <div className="absolute top-1/2 left-1/2 h-32 w-32 rounded-full bg-cyan-300 blur-3xl opacity-10 animate-pulse" />
          </div>

          <CardContent className="relative p-6 md:p-8">
            <div className="grid gap-6 lg:grid-cols-2 items-center">
              {/* Left side - Content with Icons */}
              <div className="space-y-4">
                {/* Icon Row */}
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 shadow-md transform hover:scale-110 transition-transform">
                    <Apple className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md transform hover:scale-110 transition-transform">
                    <Flame className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-md transform hover:scale-110 transition-transform">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                    Track Your Nutrition
                  </h2>
                  <p className="text-base text-muted-foreground mb-3 leading-snug">
                    Complement your workouts with intelligent meal tracking. Our AI-powered Calorie Counter analyzes your food images to provide instant nutritional insights.
                  </p>
                </div>

                {/* Features with better icons */}
                <div className="space-y-2 bg-white/40 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-500/20">
                      <div className="h-1 w-1 rounded-full bg-teal-600" />
                    </div>
                    <span className="text-xs font-medium text-foreground">AI-Powered Food Recognition</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-500/20">
                      <div className="h-1 w-1 rounded-full bg-teal-600" />
                    </div>
                    <span className="text-xs font-medium text-foreground">Real-time Calorie & Macro Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-500/20">
                      <div className="h-1 w-1 rounded-full bg-teal-600" />
                    </div>
                    <span className="text-xs font-medium text-foreground">Personalized Nutrition Insights</span>
                  </div>
                </div>

                <Link to="/calorie-counter">
                  <Button 
                    className="mt-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105 w-full md:w-auto rounded-xl border-0 font-semibold tracking-wide"
                    size="lg"
                  >
                    <Apple className="h-6 w-6 mr-2" />
                    Start Tracking
                    <ArrowRight className="h-6 w-6 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Right side - Enhanced Visual with animated cards */}
              <div className="hidden lg:block">
                <div className="relative h-80 w-full">
                  {/* Main stat card - Large centered */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96">
                    <div className="rounded-xl bg-white/70 backdrop-blur-md border-2 border-white/60 p-5 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold text-foreground">Daily Intake</span>
                        <div className="flex items-center gap-1.5 bg-emerald-100/60 px-2 py-1 rounded-full">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-xs font-medium text-emerald-700">On Track</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text">
                            2,150
                          </p>
                          <p className="text-xs text-muted-foreground">kcal consumed</p>
                        </div>
                        <div className="space-y-1.5">
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full" style={{ width: '75%' }} />
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">75% of goal</span>
                            <span className="font-semibold text-teal-600">650 kcal left</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Macros card - Bottom Left */}
                  <div className="absolute bottom-0 left-0 w-44">
                    <div className="rounded-lg bg-white/60 backdrop-blur border border-white/50 p-4 shadow-md hover:shadow-lg transition-all transform hover:scale-110 hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-100/60">
                            <span className="text-xs font-bold text-teal-700">P</span>
                          </div>
                          <span className="text-xs font-semibold text-foreground">Protein</span>
                        </div>
                        <div className="text-xs font-bold text-teal-600">45%</div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-teal-400 to-teal-500 h-2 rounded-full" style={{ width: '45%' }} />
                        </div>
                        <p className="text-xs text-muted-foreground">120g / 266g</p>
                      </div>
                    </div>
                  </div>

                  {/* Carbs card - Bottom Right */}
                  <div className="absolute bottom-0 right-0 w-44">
                    <div className="rounded-lg bg-white/60 backdrop-blur border border-white/50 p-4 shadow-md hover:shadow-lg transition-all transform hover:scale-110 hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100/60">
                            <span className="text-xs font-bold text-emerald-700">C</span>
                          </div>
                          <span className="text-xs font-semibold text-foreground">Carbs</span>
                        </div>
                        <div className="text-xs font-bold text-emerald-600">35%</div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2 rounded-full" style={{ width: '35%' }} />
                        </div>
                        <p className="text-xs text-muted-foreground">220g / 625g</p>
                      </div>
                    </div>
                  </div>

                  {/* Fats card - Middle */}
                  <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 w-40">
                    <div className="rounded-lg bg-white/60 backdrop-blur border border-white/50 p-4 shadow-md hover:shadow-lg transition-all transform hover:scale-110 hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-100/60">
                            <span className="text-xs font-bold text-cyan-700">F</span>
                          </div>
                          <span className="text-xs font-semibold text-foreground">Fats</span>
                        </div>
                        <div className="text-xs font-bold text-cyan-600">20%</div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 h-2 rounded-full" style={{ width: '20%' }} />
                        </div>
                        <p className="text-xs text-muted-foreground">60g / 300g</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile View - Simplified Cards */}
              <div className="lg:hidden">
                <div className="grid grid-cols-3 gap-2">
                  {/* Card 1 */}
                  <div className="rounded-lg bg-white/60 backdrop-blur border border-white/50 p-2 text-center hover:shadow-md transition-all">
                    <Flame className="h-5 w-5 text-teal-600 mx-auto mb-1 animate-pulse" />
                    <p className="text-lg font-bold text-foreground">2,150</p>
                    <p className="text-xs text-muted-foreground">Calories</p>
                  </div>

                  {/* Card 2 */}
                  <div className="rounded-lg bg-white/60 backdrop-blur border border-white/50 p-2 text-center hover:shadow-md transition-all">
                    <div className="h-5 w-5 rounded-full bg-gradient-to-r from-teal-400 to-teal-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">45%</p>
                    <p className="text-xs text-muted-foreground">Protein</p>
                  </div>

                  {/* Card 3 */}
                  <div className="rounded-lg bg-white/60 backdrop-blur border border-white/50 p-2 text-center hover:shadow-md transition-all">
                    <div className="h-5 w-5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">35%</p>
                    <p className="text-xs text-muted-foreground">Carbs</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

