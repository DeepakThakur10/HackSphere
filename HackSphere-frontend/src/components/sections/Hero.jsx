import { ArrowRight, ShieldCheck, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import Card from '../ui/Card';
import PageContainer from '../common/PageContainer';
import Lightfall from '../visuals/Lightfall';
import Aurora from '../ui/Aurora';
import DecryptedText from '../ui/DecryptedText';
import Magnet from '../ui/Magnet';

const highlights = [
  { icon: Zap, label: 'Launch faster', value: 'Set up events in minutes' },
  { icon: Users, label: 'Coordinate teams', value: 'Centralize participants and judges' },
  { icon: ShieldCheck, label: 'Stay in control', value: 'Simple role-based workflows' },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <Aurora />
      <PageContainer className="relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative">
            <div className="mb-6 inline-flex items-center rounded-full border border-brand-100 bg-brand-50/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-brand-700">
              Premium hackathon operations for modern teams
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
              Run <DecryptedText text="hackathons" animateOn="both" className="text-brand-600 font-bold" /> like a product team, not a spreadsheet.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary">
              HackSphere helps organizers launch beautiful events, manage submissions, review projects, and keep participants informed with a calm, professional experience.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Magnet magnetStrength={0.25}>
                <Button as={Link} to="/signup" size="lg">
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Magnet>
              <Magnet magnetStrength={0.25}>
                <Button as={Link} to="/hackathons" variant="secondary" size="lg">
                  Explore hackathons
                </Button>
              </Magnet>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <Card key={item.label} className="p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-text-primary">{item.label}</p>
                    <p className="mt-1 text-sm leading-6 text-text-secondary">{item.value}</p>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(44,143,255,0.18),transparent_55%)] blur-3xl" />
            <Card className="relative overflow-hidden p-0">
              <div className="pointer-events-none absolute inset-0">
                <Lightfall
                  colors={['#A6C8FF', '#5227FF', '#FF9FFC']}
                  backgroundColor="#0A29FF"
                  speed={1}
                  streakCount={8}
                  streakWidth={1}
                  streakLength={1}
                  glow={1}
                  density={1}
                  twinkle={1}
                  zoom={2}
                  backgroundGlow={1}
                  opacity={1}
                  mouseInteraction
                  mouseStrength={1}
                  mouseRadius={0.6}
                />
              </div>

              <div className="relative z-10 border-b border-border bg-gradient-to-br from-white/95 to-brand-50/95 px-6 py-5 sm:px-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Live dashboard preview</p>
                    <h2 className="mt-1 text-xl font-semibold text-text-primary">Hackathon control center</h2>
                  </div>
                  <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                    128 active teams
                  </span>
                </div>
              </div>

              <div className="relative z-10 space-y-4 p-6 sm:p-8">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-surfaceMuted p-4">
                    <p className="text-sm text-text-muted">Registered participants</p>
                    <p className="mt-2 text-3xl font-semibold text-text-primary">18,402</p>
                  </div>
                  <div className="rounded-2xl bg-surfaceMuted p-4">
                    <p className="text-sm text-text-muted">Submissions reviewed</p>
                    <p className="mt-2 text-3xl font-semibold text-text-primary">9,814</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-white p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-text-primary">Next review cycle</p>
                      <p className="mt-1 text-sm text-text-secondary">Judges notified automatically in 12 minutes</p>
                    </div>
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                      On schedule
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/60 p-5 text-sm leading-6 text-text-secondary">
                  A clean, single-screen workflow for registration, project submission, and final leaderboard publishing.
                </div>
              </div>
            </Card>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
