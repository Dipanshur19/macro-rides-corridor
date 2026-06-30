import { useStore } from '@/store/useStore';
import Card from '@/components/ui/Card';
import Slider from '@/components/ui/Slider';
import Segmented from '@/components/ui/Segmented';
import {
  MIN_BUFFER_METERS,
  MAX_BUFFER_METERS,
  MIN_H3_RESOLUTION,
  MAX_H3_RESOLUTION,
  MIN_LOOKAHEAD_METERS,
  MAX_LOOKAHEAD_METERS,
  H3_RES_INFO,
} from '@/constants/config';
import type { CorridorMode } from '@/types';

export default function CorridorControl() {
  const resolution = useStore((s) => s.resolution);
  const setResolution = useStore((s) => s.setResolution);
  const bufferMeters = useStore((s) => s.bufferMeters);
  const setBuffer = useStore((s) => s.setBuffer);
  const mode = useStore((s) => s.corridorMode);
  const setMode = useStore((s) => s.setCorridorMode);
  const lookAhead = useStore((s) => s.lookAheadMeters);
  const setLookAhead = useStore((s) => s.setLookAhead);

  return (
    <Card title="Corridor Parameters" icon={<span>📐</span>}>
      <Slider
        label="Buffer (half-width)"
        value={bufferMeters}
        display={`${bufferMeters} m`}
        min={MIN_BUFFER_METERS}
        max={MAX_BUFFER_METERS}
        step={25}
        onChange={setBuffer}
      />
      <Slider
        label="H3 resolution"
        value={resolution}
        display={`${H3_RES_INFO[resolution].label} · ~${H3_RES_INFO[resolution].edge} m`}
        min={MIN_H3_RESOLUTION}
        max={MAX_H3_RESOLUTION}
        onChange={setResolution}
      />
      <div className="mb-3">
        <div className="mb-1.5 text-xs text-muted">Corridor mode</div>
        <Segmented<CorridorMode>
          value={mode}
          onChange={setMode}
          options={[
            { value: 'ahead', label: 'Look-ahead' },
            { value: 'full', label: 'Whole route' },
          ]}
        />
      </div>
      {mode === 'ahead' && (
        <Slider
          label="Look-ahead window"
          value={lookAhead}
          display={`${(lookAhead / 1000).toFixed(1)} km`}
          min={MIN_LOOKAHEAD_METERS}
          max={MAX_LOOKAHEAD_METERS}
          step={100}
          onChange={setLookAhead}
        />
      )}
    </Card>
  );
}
