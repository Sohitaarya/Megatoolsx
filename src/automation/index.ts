/**
 * Automation — public surface.
 */
export { workflowEngine, evalCondition } from './workflowEngine'
export type { WorkflowRunOptions } from './workflowEngine'
export { TaskQueue, defaultQueue } from './queue'
export type { Task, TaskStatus, TaskHandler } from './queue'
export { MultiAgentSystem, AgentMemory, multiAgentSystem, registerDefaultAgents } from './agents'
export type { AgentDefinition, AgentRole, AgentMessage, AgentMemoryEntry } from './agents'
export { canvasToWorkflow, workflowToCanvas, BLOCK_PALETTE } from './noCode'
export type { NoCodeCanvas, BuilderBlock } from './noCode'
export type {
  Workflow, WorkflowNode, WorkflowEdge, WorkflowContext, NodeResult, ActionHandler,
  NodeKind, LogicType, TriggerType, ActionType,
} from './types'