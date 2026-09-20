import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Room, RoomPosition, CharacterStatus, CharacterState, MovementLogEntry, PlayerAction } from '../../../../shared/types.js';
import { computeRoomPositions } from '../../../../shared/utils/movement.js';
import { VaultCanvas } from '../VaultCanvas.js';
import { User, CheckCircle2, Lock, Zap, DollarSign, Clock, Sparkles, Layers, ListFilter } from 'lucide-react';
import { soundFx } from '../../utils/audio.js';

interface PlayerPanelProps {
  rooms: Room[];
  timeBudget: number;
  timeRemaining: number;
  timeElapsed: number;
  onRecordAction: (action: PlayerAction, movementEntries: MovementLogEntry[]) => void;
  onLootSuccess: (room: Room) => void;
  playerTotalValue: number;
  isFinished: boolean;
  lootedRoomIds: Set<string>;
}

export const PlayerPanel: React.FC<PlayerPanelProps> = ({
  rooms,
  timeBudget,
  timeRemaining,
  timeElapsed,
  onRecordAction,
  onLootSuccess,
  playerTotalValue,
  isFinished,
  lootedRoomIds
}) => {
  const [viewMode, setViewMode] = useState<'blueprint' | 'tactical'>('blueprint');
  const [hintActive, setHintActive] = useState(false);

  // Compute fixed 2D room positions
  const roomPositions = useMemo(() => computeRoomPositions(rooms, 640, 340), [rooms]);
  const posMap = useMemo(() => new Map(roomPositions.map((p) => [p.roomId, p])), [roomPositions]);
  const roomMap = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);

  // Character movement state machine
  const [charX, setCharX] = useState(30);
  const [charY, setCharY] = useState(50);
  const [charStatus, setCharStatus] = useState<CharacterStatus>('idle');
  const [charFacing, setCharFacing] = useState<'left' | 'right'>('right');
  const [currentTargetRoomId, setCurrentTargetRoomId] = useState<string | null>(null);
  const [queue, setQueue] = useState<string[]>([]);
  const [transitionDuration, setTransitionDuration] = useState(0.5);
  const [lootingProgress, setLootingProgress] = useState(0);

  const timeElapsedRef = useRef(timeElapsed);
  timeElapsedRef.current = timeElapsed;

  const isFinishedRef = useRef(isFinished);
  isFinishedRef.current = isFinished;

  // Best unlooted room for greedy hint power-up
  const unlootedRooms = rooms.filter((r) => !lootedRoomIds.has(r.id) && r.timeCost <= timeRemaining);
  const bestRatioRoom = unlootedRooms.length > 0
    ? [...unlootedRooms].sort((a, b) => (b.value / b.timeCost) - (a.value / a.timeCost))[0]
    : null;

  // Queue click handler
  const handleQueueRoom = (room: Room) => {
    if (isFinished || lootedRoomIds.has(room.id) || queue.includes(room.id) || currentTargetRoomId === room.id) {
      return;
    }
    soundFx.playLockpickTick();
    setQueue((prev) => [...prev, room.id]);
  };

  // State machine loop: pops next room from queue when idle
  useEffect(() => {
    if (isFinished || charStatus !== 'idle' || queue.length === 0) {
      return;
    }

    const nextRoomId = queue[0];
    const targetPos = posMap.get(nextRoomId);
    const targetRoom = roomMap.get(nextRoomId);
    if (!targetPos || !targetRoom) {
      setQueue((q) => q.slice(1));
      return;
    }

    // Calculate distance and duration at constant ~160 px/sec
    const dx = targetPos.x - charX;
    const dy = targetPos.y - charY;
    const dist = Math.hypot(dx, dy);
    const moveDuration = Math.max(0.4, dist / 160);

    const facing = targetPos.x >= charX ? 'right' : 'left';
    setCharFacing(facing);
    setTransitionDuration(moveDuration);
    setCharX(targetPos.x);
    setCharY(targetPos.y);
    setCharStatus('running');
    setCurrentTargetRoomId(nextRoomId);
    setQueue((q) => q.slice(1));

    const startTimestamp = timeElapsedRef.current;
    const moveStartEntry: MovementLogEntry = {
      timestamp: startTimestamp,
      roomId: nextRoomId,
      eventType: 'lootStart'
    };

    // Schedule arrival
    const arrivalTimer = setTimeout(() => {
      const arrivedTimestamp = timeElapsedRef.current;
      setCharStatus('looting');
      setTransitionDuration(0);
      setLootingProgress(0);

      const arrivedEntry: MovementLogEntry = {
        timestamp: arrivedTimestamp,
        roomId: nextRoomId,
        eventType: 'arrived'
      };

      // Looting lockpick progress interval
      const lootDurationMs = targetRoom.timeCost * 1000;
      const startTime = Date.now();

      const progressInterval = setInterval(() => {
        const elapsedMs = Date.now() - startTime;
        const progress = Math.min(1, elapsedMs / lootDurationMs);
        setLootingProgress(progress);

        if (progress >= 1) {
          clearInterval(progressInterval);
          soundFx.playLootSuccess();

          const completeTimestamp = timeElapsedRef.current;
          const completeEntry: MovementLogEntry = {
            timestamp: completeTimestamp,
            roomId: nextRoomId,
            eventType: 'lootComplete'
          };

          onRecordAction(
            { roomId: nextRoomId, timestamp: arrivedTimestamp },
            [moveStartEntry, arrivedEntry, completeEntry]
          );
          onLootSuccess(targetRoom);

          setCharStatus('idle');
          setCurrentTargetRoomId(null);
          setLootingProgress(0);
        }
      }, 50);

    }, moveDuration * 1000);

    return () => {
      clearTimeout(arrivalTimer);
    };
  }, [charStatus, queue, charX, charY, posMap, roomMap, isFinished, onRecordAction, onLootSuccess]);

  const disabledRoomIds = useMemo(() => {
    const set = new Set<string>();
    rooms.forEach((r) => {
      if (r.timeCost > timeRemaining && !lootedRoomIds.has(r.id)) {
        set.add(r.id);
      }
    });
    return set;
  }, [rooms, timeRemaining, lootedRoomIds]);

  return (
    <div className="glass-panel glass-panel-glow-player" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(0,240,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f0ff' }}>
            <User size={18} />
          </div>
          <div>
            <h3 className="font-display" style={{ fontSize: '1.1rem', color: '#00f0ff', fontWeight: 700 }}>
              YOU (OPERATOR)
            </h3>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {charStatus === 'running' ? '⚡ Sprinting to target...' : charStatus === 'looting' ? '🔓 Hacking terminal...' : '🟢 Ready for orders'}
            </div>
          </div>
        </div>

        {/* Live Score */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Secured Loot</div>
          <div className="font-mono" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#00f0ff' }}>
            ${playerTotalValue}k
          </div>
        </div>
      </div>

      {/* Control & Power-Up Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '8px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => { soundFx.playClick(); setViewMode('blueprint'); }}
            className="btn-cyber btn-secondary"
            style={{ padding: '4px 8px', fontSize: '0.7rem', background: viewMode === 'blueprint' ? '#00f0ff' : 'transparent', color: viewMode === 'blueprint' ? '#050a14' : '#f8fafc' }}
          >
            <Layers size={12} /> 2D Blueprint
          </button>
          <button
            onClick={() => { soundFx.playClick(); setViewMode('tactical'); }}
            className="btn-cyber btn-secondary"
            style={{ padding: '4px 8px', fontSize: '0.7rem', background: viewMode === 'tactical' ? '#00f0ff' : 'transparent', color: viewMode === 'tactical' ? '#050a14' : '#f8fafc' }}
          >
            <ListFilter size={12} /> Target Cards
          </button>
        </div>

        <button
          onClick={() => { soundFx.playLootSuccess(); setHintActive(true); setTimeout(() => setHintActive(false), 4000); }}
          disabled={hintActive || isFinished || unlootedRooms.length === 0}
          className="btn-cyber btn-secondary"
          style={{ fontSize: '0.75rem', padding: '4px 10px', color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)' }}
          title="Highlight top value/time room"
        >
          <Sparkles size={13} />
          <span>{hintActive ? 'Greedy Scan!' : 'Greedy Hint'}</span>
        </button>
      </div>

      {/* Main Interactive Arena: Blueprint or Tactical Cards */}
      <div style={{ flex: 1, minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
        {viewMode === 'blueprint' ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <VaultCanvas
              rooms={rooms}
              roomPositions={roomPositions}
              lootedRoomIds={lootedRoomIds}
              queue={queue}
              activeRoomId={currentTargetRoomId}
              onRoomClick={handleQueueRoom}
              disabledRoomIds={disabledRoomIds}
              hintRoomId={hintActive && bestRatioRoom ? bestRatioRoom.id : null}
              characters={[
                {
                  x: charX,
                  y: charY,
                  status: charStatus,
                  variant: 'player',
                  facing: charFacing,
                  name: 'OPERATOR',
                  transitionDuration
                }
              ]}
              width={640}
              height={340}
              isInteractive={!isFinished}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>
              💡 Click any room portal to queue movement. The character will run & loot in sequence!
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', paddingRight: '4px' }}>
            {rooms.map((room) => {
              const isLooted = lootedRoomIds.has(room.id);
              const isCurrent = currentTargetRoomId === room.id;
              const queueIdx = queue.indexOf(room.id);
              const isQueued = queueIdx !== -1;
              const canAfford = room.timeCost <= timeRemaining;
              const isDisabled = isLooted || isFinished || (!isCurrent && !isQueued && !canAfford);

              return (
                <div
                  key={room.id}
                  onClick={() => handleQueueRoom(room)}
                  style={{
                    background: isCurrent
                      ? 'rgba(0, 240, 255, 0.15)'
                      : isLooted
                      ? 'rgba(16, 185, 129, 0.08)'
                      : isQueued
                      ? 'rgba(168, 85, 247, 0.12)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isCurrent
                      ? '1px solid #00f0ff'
                      : isLooted
                      ? '1px solid rgba(16, 185, 129, 0.4)'
                      : isQueued
                      ? '1px solid #c084fc'
                      : '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    cursor: !isDisabled ? 'pointer' : 'default',
                    opacity: isDisabled && !isLooted ? 0.4 : 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div className="font-display" style={{ fontWeight: 700, fontSize: '0.85rem', color: isLooted ? '#34d399' : '#f8fafc' }}>
                      {room.name}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <span>Cost: <strong style={{ color: '#00f0ff' }}>{room.timeCost}s</strong></span>
                      <span>Value: <strong style={{ color: '#f59e0b' }}>${room.value}k</strong></span>
                    </div>
                  </div>

                  <div>
                    {isLooted ? (
                      <span className="badge badge-bnb"><CheckCircle2 size={12} /> SECURED</span>
                    ) : isCurrent ? (
                      <span className="badge badge-player animate-pulse-glow">
                        {charStatus === 'running' ? 'RUNNING' : `HACKING (${Math.round(lootingProgress * 100)}%)`}
                      </span>
                    ) : isQueued ? (
                      <span className="badge badge-dp">QUEUED #{queueIdx + 1}</span>
                    ) : (
                      <button className="btn-cyber btn-primary" style={{ padding: '3px 8px', fontSize: '0.7rem' }}>
                        QUEUE
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
