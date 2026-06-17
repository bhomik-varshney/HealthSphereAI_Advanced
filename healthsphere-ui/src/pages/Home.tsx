import { Link } from "react-router-dom";
import { 
  MessageSquare, 
  FileSearch, 
  MapPin, 
  ArrowRight,
  Stethoscope,
  ShieldCheck,
  Zap,
  Heart,
  Dumbbell,
  Wind,
  Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const quickActions = [
  {
    title: "Ask the AI Doctor",
    description: "Get instant answers to your health questions from our AI assistant",
    icon: MessageSquare,
    href: "/ask-ai",
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Analyze My Report",
    description: "Upload medical reports and get AI-powered insights and summaries",
    icon: FileSearch,
    href: "/ask-ai?tab=report",
    color: "bg-success/10 text-success",
  },
  {
    title: "Find Nearby Hospitals",
    description: "Locate hospitals and healthcare facilities near your location",
    icon: MapPin,
    href: "/hospitals",
    color: "bg-accent/10 text-accent",
  },
  {
    title: "Fitness Tracker",
    description: "Track your workouts and achieve your fitness goals with AI guidance",
    icon: Dumbbell,
    href: "/fitness",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Vital Lung AI",
    description: "Clinical-grade chest X-ray analysis powered by advanced deep learning",
    icon: Wind,
    href: "/scan-test-ai",
    color: "bg-cyan-100 text-cyan-600",
  },
  {
    title: "TumorVision AI",
    description: "Clinical-grade brain MRI diagnostic assistant for tumor detection",
    icon: Brain,
    href: "/tumor-vision-ai",
    color: "bg-purple-100 text-purple-600",
  },
];

const features = [
  {
    icon: Stethoscope,
    title: "Expert AI Analysis",
    description: "Powered by advanced language models for accurate health guidance",
  },
  {
    icon: ShieldCheck,
    title: "Private & Secure",
    description: "Your health data is protected with enterprise-grade security",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get answers and analysis in seconds, not hours",
  },
  {
    icon: Heart,
    title: "Personalized Care",
    description: "Context-aware conversations that remember your history",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-animated opacity-90" />
        
        {/* Pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="container relative z-10 px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              <span className="text-sm font-medium text-white">
                AI-Powered Health Assistant
              </span>
            </div>
            
            <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-white md:text-6xl">
              Your Personal
              <br />
              <span className="text-white/90">Health Companion</span>
            </h1>
            
            <p className="mb-8 text-lg text-white/80 md:text-xl">
              Get instant AI-powered health insights, analyze medical reports, 
              and find healthcare facilities—all in one place.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="xl" variant="glass">
                <Link to="/ask-ai">
                  Start Chatting
                  <ArrowRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="glass" className="bg-white/10">
                <Link to="/hospitals">
                  <MapPin className="mr-1 h-5 w-5" />
                  Find Hospitals
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              className="fill-background"
            />
          </svg>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="container px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            What can we help you with?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Choose an option to get started with your health journey
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.href} to={action.href}>
              <Card variant="interactive" className="h-full">
                <CardHeader>
                  <div className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl ${action.color}`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{action.title}</CardTitle>
                  <CardDescription className="text-base">
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="inline-flex items-center text-sm font-medium text-primary">
                    Get started
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-y bg-secondary/30 py-16">
        <div className="container px-4">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Why HealthSphere AI?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Built with cutting-edge technology for your peace of mind
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="text-center fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 font-display font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container px-4 py-16">
        <Card variant="gradient" className="overflow-hidden">
          <div className="relative p-8 md:p-12">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
            
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                Ready to take control of your health?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Start a conversation with our AI doctor today and get the answers you need.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" variant="hero">
                  <Link to="/ask-ai">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Start Chatting Now
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 HealthSphere AI. Your trusted health companion.
          </p>
          <p className="mt-2 text-xs text-muted-foreground/70">
            This is an AI assistant and should not replace professional medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
