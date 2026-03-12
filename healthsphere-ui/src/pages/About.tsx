import { 
  Activity, 
  Shield, 
  Users, 
  Brain,
  Mail,
  Github,
  Twitter,
  Heart
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const teamMembers = [
  {
    name: "Dr. Sarah Chen",
    role: "Chief Medical Officer",
    description: "20+ years in healthcare technology",
  },
  {
    name: "Alex Kumar",
    role: "Lead AI Engineer",
    description: "Former Google Health researcher",
  },
  {
    name: "Dr. Michael Torres",
    role: "Medical Advisor",
    description: "Board-certified internal medicine",
  },
];

const values = [
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your health data is encrypted and never shared without consent",
  },
  {
    icon: Brain,
    title: "AI-Powered",
    description: "Cutting-edge language models trained on medical literature",
  },
  {
    icon: Users,
    title: "User-Centric",
    description: "Designed with patients and healthcare providers in mind",
  },
  {
    icon: Heart,
    title: "Compassionate Care",
    description: "Technology that enhances, not replaces, human connection",
  },
];

export default function About() {
  return (
    <div className="container px-4 py-8">
      {/* Hero */}
      <div className="mb-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-glow">
          <Activity className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
          About HealthSphere AI
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          We're on a mission to make healthcare information accessible to everyone 
          through the power of artificial intelligence.
        </p>
      </div>

      {/* Story */}
      <Card className="mb-12">
        <CardContent className="p-8 md:p-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 font-display text-2xl font-bold text-foreground">
              Our Story
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                HealthSphere AI was born from a simple observation: navigating healthcare 
                information is overwhelming. Between medical jargon, conflicting advice, 
                and the anxiety of health concerns, people deserve a better way to 
                understand their health.
              </p>
              <p>
                We combined expertise in medicine, artificial intelligence, and user 
                experience to create an AI health assistant that speaks your language. 
                Whether you're trying to understand lab results, find the right hospital, 
                or simply get answers to health questions, we're here to help.
              </p>
              <p>
                Our AI is powered by the latest language models, trained on vast medical 
                literature, and designed to provide accurate, empathetic responses. 
                But we never forget: we're a complement to professional medical care, 
                not a replacement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Values */}
      <div className="mb-12">
        <h2 className="mb-8 text-center font-display text-2xl font-bold text-foreground">
          Our Values
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <Card key={value.title} variant="gradient" className="text-center">
              <CardHeader>
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{value.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="mb-12">
        <h2 className="mb-8 text-center font-display text-2xl font-bold text-foreground">
          Meet Our Team
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {teamMembers.map((member) => (
            <Card key={member.name} variant="interactive">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20" />
                <h3 className="font-display font-semibold text-foreground">
                  {member.name}
                </h3>
                <p className="text-sm text-primary">{member.role}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {member.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-8 text-center">
          <h2 className="mb-4 font-display text-2xl font-bold text-foreground">
            Get in Touch
          </h2>
          <p className="mx-auto mb-6 max-w-md text-muted-foreground">
            Have questions, feedback, or want to partner with us? 
            We'd love to hear from you.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button variant="hero">
              <Mail className="mr-2 h-4 w-4" />
              Contact Us
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" size="icon">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon">
                <Github className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="mt-12 rounded-lg border border-warning/20 bg-warning/5 p-6 text-center">
        <h3 className="mb-2 font-semibold text-foreground">Medical Disclaimer</h3>
        <p className="text-sm text-muted-foreground">
          HealthSphere AI is designed to provide general health information and is not 
          a substitute for professional medical advice, diagnosis, or treatment. Always 
          seek the advice of your physician or other qualified health provider with any 
          questions you may have regarding a medical condition.
        </p>
      </div>
    </div>
  );
}
