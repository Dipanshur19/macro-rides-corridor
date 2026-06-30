import { Play, Pause, RotateCcw } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { SPEED_MULTIPLIERS } from '@/constants/config';
import Card from '@/components/ui/Card';
import Slider from '@/components/ui/Slider';
import Segmented from '@/components/ui/Segmented';
import Toggle from '@/components/ui/Toggle';
import { formatKm } from '@/utils/helpers';

export default function SimulationControl({ totalMeters }: { totalMeters: number }) {
  const isPlaying = useStore((s) => s.isPlaying);
  const togglePlay = useStore((s) => s.togglePlay);
  const reset = useStore((s) => s.reset);
  const progress = useStore((s) => s.progressMeters);
  const seek = useStore((s) => s.seek);
  const speedKmh = useStore((s) => s.speedKmh);
  const setSpeed = useStore((s) => s.setSpeed);
  const multiplier = useStore((s) => s.speedMultiplier);
  const setMultiplier = useStore((s) => s.setMultiplier);
  const followDriver = useStore((s) => s.followDriver);
  const toggleFollow = useStore((s) => s.toggleFollow);

  const atEnd = progress >= totalMeters - 0.5;

  return (
    <Card title="Live Simulation" icon={<span>🎮</span>}>
      <div className="mb-3 flex gap-2">
        <button
          onClick={togglePlay}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-semibold text-white transition-transform duration-100 hover:bg-primary-hover active:scale-[0.97]"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          {isPlaying ? 'Pause' : atEnd ? 'Replay' : 'Play'}
        </button>
        <button
          onClick={reset}
          className="flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-medium text-muted transition-transform duration-100 hover:text-text active:scale-[0.97]"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      <Slider
        label="Position along route"
        value={progress}
        display={`${formatKm(progress)} / ${formatKm(totalMeters)}`}
        min={0}
        max={Math.max(1, totalMeters)}
        onChange={seek}
      />

      <Slider
        label="Driver speed"
        value={speedKmh}
        display={`${speedKmh} km/h`}
        min={10}
        max={80}
        step={2}
        onChange={setSpeed}
      />

      <div className="mt-1">
        <div className="mb-1.5 text-xs text-muted">Playback speed</div>
        <Segmented<number>
          value={multiplier}
          onChange={setMultiplier}
          options={SPEED_MULTIPLIERS.map((m) => ({ value: m, label: `${m}x` }))}
        />
      </div>

      <div className="mt-3 border-t border-border pt-2">
        <Toggle
          label="Camera follows driver"
          checked={followDriver}
          onChange={toggleFollow}
        />
      </div>
    </Card>
  );
}
