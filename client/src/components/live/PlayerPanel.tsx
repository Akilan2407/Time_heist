import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Room, RoomPosition, CharacterStatus, CharacterState, MovementLogEntry, PlayerAction, Guard } from '../../../../shared/types.js';
import { computeRoomPositions, getGuardPositionAtTime } from '../../../../shared/utils/movement.js';
import { getGreedyHint } from '../../../../shared/algorithms/greedy.js';
import { VaultCanvas } from '../VaultCanvas.js';
import { User, CheckCircle2, Lock, Zap, DollarSign, Clock, Sparkles, Layers, ListFilter, ShieldAlert, AlertOctagon, Flame, Radio, HelpCircle, Eye, Lightbulb } from 'lucide-react';
import { soundFx } from '../../utils/audio.js';

// Configurable Stealth & Scout Constants
export const GUARD_DETECTION_DISTANCE = 46; // Pixel collision tolerance
export const CAUGHT_VALUE_PENALTY = 25;      // $25k loot confiscated on security breach
export const CAUGHT_TIME_PENALTY = 5;       // 5 seconds alarm penalty
export const PROXIMITY_REVEAL_DISTANCE = 115; // Pixel proximity for automatic fog-of-war discovery

interface PlayerPanelProps {
  rooms: Room[];
  guards?: Guard[];
  timeBudget: number;
  timeRemaining: number;
  timeElapsed: number;
  onRecordAction: (action: PlayerAction, movementEntries: MovementLogEntry[]) => void;
  onLootSuccess: (room: Room) => void;
  onPenaltyDeducted?: (valuePenalty: number, timePenalty: number) => void;
  playerTotalValue: number;
  isFinished: boolean;
  lootedRoomIds: Set<string>;
}

export const PlayerPanel: React.FC<PlayerPanelProps> = ({
  rooms,
  guards = [],
  timeBudget,
  timeRemaining,
  timeElapsed,
  onRecordAction,
  onLootSuccess,
  onPenaltyDeducted,
  playerTotalValue,
  isFinished,
  lootedRoomIds
}) => {
  const [viewMode, setViewMode] = useState<'blueprint' | 'tactical'>('blueprint');
  const [hintCharges, setHintCharges] = useState(2);
  const [hintActiveRoomId, setHintActiveRoomId] = useState<string | null>(null);
  const [breachAlert, setBreachAlert] = useState<{ active: boolean; message: string; guardName: string } | null>(null);
  const [isStunned, setIsStunned] = useState(false);

  // Fog of War & Scout Drone State
  const [revealedRoomIds, setRevealedRoomIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (rooms.length > 0) initial.add(rooms[0].id); // First room revealed as starting point
    return initial;
  });
  const [scoutCharges, setScoutCharges] = useState(3);
  const [isScoutMode, setIsScoutMode] = useState(false);

  // Compute fixed 2D room positions
  const roomPositions = useMemo(() => computeRoomPositions(rooms, 740, 440), [rooms]);
  const posMap = useMemo(() => new Map(roomPositions.map((p) => [p.roomId, p])), [roomPositions]);
  const roomMap = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);

  // Character movement state
  const [charX, setCharX] = useState(30);
  const [charY, setCharY] = useState(60);
  const [charStatus, setCharStatus] = useState<CharacterStatus>('idle');
  const [charFacing, setCharFacing] = useState<'left' | 'right'>('right');
  const [currentTargetRoomId, setCurrentTargetRoomId] = useState<string | null>(null);
  const [queue, setQueue] = useState<string[]>([]);
  const [transitionDuration, setTransitionDuration] = useState(0.5);
  const [lootingProgress, setLootingProgress] = useState(0);

  // References for reliable access in async callbacks
  const timeElapsedRef = useRef(timeElapsed);
  timeElapsedRef.current = timeElapsed;

  const charStatusRef = useRef(charStatus);
  charStatusRef.current = charStatus;

  const currentTargetRef = useRef(currentTargetRoomId);
  currentTargetRef.current = currentTargetRoomId;

  const charPosRef = useRef({ x: charX, y: charY });
  charPosRef.current = { x: charX, y: charY };

  const queueRef = useRef(queue);
  queueRef.current = queue;

  const isFinishedRef = useRef(isFinished);
  isFinishedRef.current = isFinished;

  const isStunnedRef = useRef(isStunned);
  isStunnedRef.current = isStunned;

  const arrivalTimerRef = useRef<any>(null);
  const activeLockpickIntervalRef = useRef<any>(null);
  const hintTimerRef = useRef<any>(null);
  const lastCaughtTimestampRef = useRef<number>(-10);

  // Greedy Knapsack Heuristic pure function evaluation
  const availableGreedyHint = useMemo(() => {
    return getGreedyHint(rooms, timeRemaining, Array.from(lootedRoomIds));
  }, [rooms, timeRemaining, lootedRoomIds]);

  // Handle Greedy Hint Power-up
  const handleUseHint = useCallback(() => {
    if (hintCharges <= 0 || isFinished) return;
    const bestRoom = getGreedyHint(rooms, timeRemaining, Array.from(lootedRoomIds));
    if (!bestRoom) return;

    soundFx.playLootSuccess();
    setHintCharges((c) => Math.max(0, c - 1));
    setHintActiveRoomId(bestRoom.id);

    // Auto-reveal the room so the player can see its exact value and time
    setRevealedRoomIds((prev) => new Set(prev).add(bestRoom.id));

    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => {
      setHintActiveRoomId(null);
    }, 4500);
  }, [hintCharges, isFinished, rooms, timeRemaining, lootedRoomIds]);

  // Proximity Auto-Reveal: reveal any room when character is near it
  useEffect(() => {
    roomPositions.forEach((pos) => {
      if (!revealedRoomIds.has(pos.roomId)) {
        const dist = Math.hypot(charX - pos.x, charY - pos.y);
        if (dist <= PROXIMITY_REVEAL_DISTANCE || currentTargetRoomId === pos.roomId) {
          setRevealedRoomIds((prev) => new Set(prev).add(pos.roomId));
        }
      }
    });
  }, [charX, charY, currentTargetRoomId, roomPositions, revealedRoomIds]);

  // Handle Scout Drone Remote Deployment
  const handleScoutRoom = useCallback((room: Room) => {
    if (scoutCharges <= 0 || revealedRoomIds.has(room.id) || isFinished) return;

    soundFx.playScoutDronePing();
    setScoutCharges((c) => {
      const next = Math.max(0, c - 1);
      if (next === 0) setIsScoutMode(false);
      return next;
    });
    setRevealedRoomIds((prev) => new Set(prev).add(room.id));
  }, [scoutCharges, revealedRoomIds, isFinished]);

  // Process next room in queue
  const processNextInQueue = useCallback(() => {
    if (isFinishedRef.current || isStunnedRef.current || charStatusRef.current !== 'idle') {
      return;
    }

    const currentQueue = queueRef.current;
    if (currentQueue.length === 0) return;

    const nextRoomId = currentQueue[0];
    const targetPos = posMap.get(nextRoomId);
    const targetRoom = roomMap.get(nextRoomId);

    if (!targetPos || !targetRoom) {
      setQueue((q) => q.slice(1));
      return;
    }

    // Auto-reveal the room the character decides to target
    setRevealedRoomIds((prev) => new Set(prev).add(nextRoomId));

    const currentX = charPosRef.current.x;
    const currentY = charPosRef.current.y;
    const dx = targetPos.x - currentX;
    const dy = targetPos.y - currentY;
    const dist = Math.hypot(dx, dy);
    const moveDuration = Math.max(0.4, dist / 180);

    const facing = targetPos.x >= currentX ? 'right' : 'left';
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

    if (arrivalTimerRef.current) clearTimeout(arrivalTimerRef.current);

    arrivalTimerRef.current = setTimeout(() => {
      if (charStatusRef.current === 'caught') return;

      const arrivedTimestamp = timeElapsedRef.current;
      setCharStatus('looting');
      setTransitionDuration(0);
      setLootingProgress(0);

      const arrivedEntry: MovementLogEntry = {
        timestamp: arrivedTimestamp,
        roomId: nextRoomId,
        eventType: 'arrived'
      };

      const lootDurationMs = targetRoom.timeCost * 1000;
      const startTime = Date.now();

      if (activeLockpickIntervalRef.current) clearInterval(activeLockpickIntervalRef.current);

      activeLockpickIntervalRef.current = setInterval(() => {
        const elapsedMs = Date.now() - startTime;
        const progress = Math.min(1, elapsedMs / lootDurationMs);
        setLootingProgress(progress);

        if (progress >= 1) {
          clearInterval(activeLockpickIntervalRef.current);
          activeLockpickIntervalRef.current = null;
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
  }, [posMap, roomMap, onRecordAction, onLootSuccess]);

  // When character becomes idle or queue has items, process queue
  useEffect(() => {
    if (charStatus === 'idle' && queue.length > 0) {
      processNextInQueue();
    }
  }, [charStatus, queue.length, processNextInQueue]);

  // Queue click handler
  const handleQueueRoom = (room: Room) => {
    if (isFinished || isStunned || lootedRoomIds.has(room.id) || queue.includes(room.id) || currentTargetRoomId === room.id) {
      return;
    }
    soundFx.playLockpickTick();
    setQueue((prev) => [...prev, room.id]);
  };

  // Real-Time Stealth Collision Detection with Sentry Guards
  useEffect(() => {
    if (isFinished || guards.length === 0) return;

    for (const guard of guards) {
      const gPos = getGuardPositionAtTime(guard, roomPositions, timeElapsed);
      const playerX = charPosRef.current.x;
      const playerY = charPosRef.current.y;
      const dist = Math.hypot(playerX - gPos.x, playerY - gPos.y);

      const cooldownPassed = (timeElapsed - lastCaughtTimestampRef.current) > 4.0;
      if (dist < GUARD_DETECTION_DISTANCE && cooldownPassed && (charStatusRef.current === 'looting' || charStatusRef.current === 'running')) {
        lastCaughtTimestampRef.current = timeElapsed;

        if (arrivalTimerRef.current) {
          clearTimeout(arrivalTimerRef.current);
          arrivalTimerRef.current = null;
        }

        if (activeLockpickIntervalRef.current) {
          clearInterval(activeLockpickIntervalRef.current);
          activeLockpickIntervalRef.current = null;
        }

        soundFx.playHeistAlarm();
        setCharStatus('caught');
        setIsStunned(true);
        setLootingProgress(0);

        setBreachAlert({
          active: true,
          message: `SPOTTED BY ${guard.name.toUpperCase()}! -$${CAUGHT_VALUE_PENALTY}k FINE & -${CAUGHT_TIME_PENALTY}s ALARM SURGE`,
          guardName: guard.name
        });

        if (onPenaltyDeducted) {
          onPenaltyDeducted(CAUGHT_VALUE_PENALTY, CAUGHT_TIME_PENALTY);
        }

        const caughtEntry: MovementLogEntry = {
          timestamp: timeElapsed,
          roomId: currentTargetRef.current || 'corridor',
          eventType: 'caught'
        };
        onRecordAction({ roomId: currentTargetRef.current || 'corridor', timestamp: timeElapsed }, [caughtEntry]);

        setTimeout(() => {
          setIsStunned(false);
          setCharStatus('idle');
          setCurrentTargetRoomId(null);
          setBreachAlert(null);
        }, 2500);

        break;
      }
    }
  }, [timeElapsed, guards, isFinished, roomPositions, onPenaltyDeducted, onRecordAction]);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      if (arrivalTimerRef.current) clearTimeout(arrivalTimerRef.current);
      if (activeLockpickIntervalRef.current) clearInterval(activeLockpickIntervalRef.current);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, []);

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
    <div className={`glass-panel glass-panel-glow-player ${breachAlert ? 'breach-alert-shake' : ''}`} style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', borderColor: breachAlert ? '#ef4444' : undefined }}>
      
      {/* Security Breach Warning Banner */}
      {breachAlert && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(239,68,68,0.9), rgba(185,28,28,0.95))',
          color: '#ffffff',
          padding: '10px 16px',
          borderRadius: '10px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 0 25px rgba(239,68,68,0.7)',
          animation: 'pulseGlow 0.8s infinite'
        }}>
          <ShieldAlert size={24} className="animate-pulse-glow" />
          <div style={{ flex: 1 }}>
            <div className="font-display" style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.04em' }}>
              🚨 SECURITY BREACH DETECTED!
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>
              {breachAlert.message}
            </div>
          </div>
          <span className="badge" style={{ background: 'rgba(0,0,0,0.5)', color: '#ffffff', fontSize: '0.7rem' }}>
            STUNNED (2s)
          </span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: isStunned ? 'rgba(239,68,68,0.25)' : 'rgba(0,240,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isStunned ? '#ef4444' : '#00f0ff' }}>
            {isStunned ? <Flame size={22} className="animate-pulse-glow" /> : <User size={22} />}
          </div>
          <div>
            <h3 className="font-display" style={{ fontSize: '1.25rem', color: isStunned ? '#ef4444' : '#00f0ff', fontWeight: 800 }}>
              YOU (OPERATOR)
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {isStunned ? '⚠️ REBOOTING OPTICAL CAMOUFLAGE...' : charStatus === 'running' ? '⚡ Sprinting to target room...' : charStatus === 'looting' ? '🔓 Hacking vault terminal...' : queue.length > 0 ? `🏃 Next Target in Queue` : '🟢 Ready for infiltration orders'}
            </div>
          </div>
        </div>

        {/* Live Score */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Secured Loot</div>
          <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 900, color: '#00f0ff' }}>
            ${playerTotalValue}k
          </div>
        </div>
      </div>

      {/* Control & Power-Up Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.35)', padding: '8px 14px', borderRadius: '10px', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => { soundFx.playClick(); setViewMode('blueprint'); }}
            className="btn-cyber btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem', background: viewMode === 'blueprint' ? '#00f0ff' : 'transparent', color: viewMode === 'blueprint' ? '#050a14' : '#f8fafc' }}
          >
            <Layers size={14} /> 2D Blueprint
          </button>
          <button
            onClick={() => { soundFx.playClick(); setViewMode('tactical'); }}
            className="btn-cyber btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem', background: viewMode === 'tactical' ? '#00f0ff' : 'transparent', color: viewMode === 'tactical' ? '#050a14' : '#f8fafc' }}
          >
            <ListFilter size={14} /> Target Cards
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Scout Drone Toggle Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              setIsScoutMode(!isScoutMode);
            }}
            disabled={scoutCharges <= 0 || isFinished}
            className="btn-cyber btn-secondary"
            style={{
              fontSize: '0.78rem',
              padding: '6px 12px',
              background: isScoutMode ? '#06b6d4' : 'rgba(6, 182, 212, 0.12)',
              color: isScoutMode ? '#050a14' : '#06b6d4',
              borderColor: 'rgba(6, 182, 212, 0.4)'
            }}
            title="Deploy remote reconnaissance probe to reveal room value/time cost"
          >
            <Radio size={14} />
            <span>{isScoutMode ? 'Click Room to Scout' : `Deploy Scout Drone (${scoutCharges})`}</span>
          </button>

          {/* Greedy Knapsack Hint Power-Up Button */}
          <button
            onClick={handleUseHint}
            disabled={hintCharges <= 0 || isFinished || !availableGreedyHint}
            className="btn-cyber btn-secondary"
            style={{
              fontSize: '0.78rem',
              padding: '6px 12px',
              color: hintCharges > 0 && availableGreedyHint ? '#f59e0b' : 'var(--text-muted)',
              borderColor: hintCharges > 0 && availableGreedyHint ? 'rgba(245, 158, 11, 0.5)' : 'rgba(255, 255, 255, 0.1)',
              background: hintActiveRoomId ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.08)'
            }}
            title={hintCharges > 0 ? 'Evaluate Greedy heuristic to highlight top value/time room' : 'No hint power-ups remaining'}
          >
            <Lightbulb size={14} className={hintActiveRoomId ? 'animate-pulse-glow' : ''} />
            <span>{hintActiveRoomId ? 'Greedy Target Lit!' : `Greedy Hint (${hintCharges} Left)`}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Arena: Enlarged Blueprint Map with Fog-of-War */}
      <div style={{ flex: 1, minHeight: '440px', display: 'flex', flexDirection: 'column' }}>
        {viewMode === 'blueprint' ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <VaultCanvas
              rooms={rooms}
              roomPositions={roomPositions}
              lootedRoomIds={lootedRoomIds}
              revealedRoomIds={revealedRoomIds}
              queue={queue}
              activeRoomId={currentTargetRoomId}
              onRoomClick={handleQueueRoom}
              onScoutRoom={handleScoutRoom}
              isScoutMode={isScoutMode}
              disabledRoomIds={disabledRoomIds}
              hintRoomId={hintActiveRoomId}
              guards={guards}
              currentTime={timeElapsed}
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
              width={740}
              height={440}
              isInteractive={!isFinished && !isStunned}
            />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
              🔍 <strong>Intel:</strong> Walk near rooms or deploy <strong>Scout Drones</strong> to decode encrypted <code>$?k</code> values!
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '450px', paddingRight: '4px' }}>
            {rooms.map((room) => {
              const isLooted = lootedRoomIds.has(room.id);
              const isRevealed = revealedRoomIds.has(room.id);
              const isCurrent = currentTargetRoomId === room.id;
              const isHint = hintActiveRoomId === room.id;
              const queueIdx = queue.indexOf(room.id);
              const isQueued = queueIdx !== -1;
              const canAfford = room.timeCost <= timeRemaining;
              const isDisabled = isLooted || isFinished || isStunned || (!isCurrent && !isQueued && !canAfford);

              return (
                <div
                  key={room.id}
                  onClick={() => handleQueueRoom(room)}
                  style={{
                    background: isCurrent
                      ? 'rgba(0, 240, 255, 0.15)'
                      : isHint
                      ? 'rgba(245, 158, 11, 0.18)'
                      : isLooted
                      ? 'rgba(16, 185, 129, 0.08)'
                      : isQueued
                      ? 'rgba(168, 85, 247, 0.12)'
                      : !isRevealed
                      ? 'rgba(30, 41, 59, 0.4)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isCurrent
                      ? '1px solid #00f0ff'
                      : isHint
                      ? '2px solid #f59e0b'
                      : isLooted
                      ? '1px solid rgba(16, 185, 129, 0.4)'
                      : isQueued
                      ? '1px solid #c084fc'
                      : !isRevealed
                      ? '1px dashed rgba(148, 163, 184, 0.3)'
                      : '1px solid var(--border-subtle)',
                    boxShadow: isHint ? '0 0 16px rgba(245, 158, 11, 0.5)' : undefined,
                    borderRadius: '10px',
                    padding: '12px 16px',
                    cursor: !isDisabled ? 'pointer' : 'default',
                    opacity: isDisabled && !isLooted ? 0.4 : 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="font-display" style={{ fontWeight: 700, fontSize: '0.95rem', color: isLooted ? '#34d399' : isHint ? '#fbbf24' : !isRevealed ? '#94a3b8' : '#f8fafc' }}>
                        {room.name}
                      </span>
                      {isHint && (
                        <span className="badge badge-player animate-pulse-glow" style={{ fontSize: '0.62rem', background: '#f59e0b', color: '#000' }}>
                          ⚡ GREEDY CHOICE
                        </span>
                      )}
                      {!isRevealed && (
                        <span className="badge badge-fog" style={{ fontSize: '0.62rem' }}>
                          <HelpCircle size={10} /> ENCRYPTED
                        </span>
                      )}
                      {room.guarded && (
                        <span className="badge badge-guard" style={{ fontSize: '0.62rem' }}>
                          PATROLLED
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '14px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {isRevealed || isLooted ? (
                        <>
                          <span>Cost: <strong style={{ color: '#00f0ff' }}>{room.timeCost}s</strong></span>
                          <span>Value: <strong style={{ color: '#f59e0b' }}>${room.value}k</strong></span>
                          <span>Efficiency: <strong style={{ color: '#10b981' }}>{(room.value / room.timeCost).toFixed(1)}k/s</strong></span>
                        </>
                      ) : (
                        <span>Intel Encrypted: <strong style={{ color: '#94a3b8' }}>$?k in ?s</strong></span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {!isRevealed && !isLooted && scoutCharges > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleScoutRoom(room);
                        }}
                        className="btn-cyber btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.7rem', color: '#06b6d4', borderColor: 'rgba(6, 182, 212, 0.4)' }}
                        title="Spend 1 Scout Drone to reveal numbers"
                      >
                        <Radio size={12} /> Scout
                      </button>
                    )}

                    {isLooted ? (
                      <span className="badge badge-bnb" style={{ fontSize: '0.75rem' }}><CheckCircle2 size={13} /> SECURED</span>
                    ) : isCurrent ? (
                      <span className="badge badge-player animate-pulse-glow" style={{ fontSize: '0.75rem' }}>
                        {charStatus === 'running' ? 'SPRINTING' : `HACKING (${Math.round(lootingProgress * 100)}%)`}
                      </span>
                    ) : isQueued ? (
                      <span className="badge badge-dp" style={{ fontSize: '0.75rem' }}>QUEUED #{queueIdx + 1}</span>
                    ) : (
                      <button className="btn-cyber btn-primary" style={{ padding: '5px 12px', fontSize: '0.75rem' }}>
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
