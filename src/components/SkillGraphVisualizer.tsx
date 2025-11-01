/**
 * Skill Graph Visualizer Component
 * Interactive 2D visualization of user skills and career role proximity
 * Uses ReactFlow for node-based graph visualization
 * Requires minimum 5 skills for accurate AI analysis
 */

import { useCallback, useEffect, useState, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  MarkerType,
  BackgroundVariant,
  MiniMap,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Target, 
  Sparkles, 
  TrendingUp, 
  Award,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { skillGraphService, SkillGraphData, RoleProximity } from '@/lib/skillGraphService';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface SkillGraphVisualizerProps {
  userSkills: string[];
  onClose?: () => void;
}

// Inner component that uses ReactFlow hooks
function SkillGraphVisualizerInner({ userSkills, onClose }: SkillGraphVisualizerProps) {
  const [loading, setLoading] = useState(true);
  const [graphData, setGraphData] = useState<SkillGraphData | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedRole, setSelectedRole] = useState<RoleProximity | null>(null);
  const [activeView, setActiveView] = useState<'graph' | 'list'>('graph');
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const containerRef = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();

  // Track window size changes
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Regenerate graph when window size changes significantly
  useEffect(() => {
    if (graphData && nodes.length > 0) {
      // Only regenerate if width changed by more than 100px (to avoid too many rerenders)
      const shouldRegenerate = Math.abs(windowSize.width - window.innerWidth) > 100;
      if (shouldRegenerate) {
        generateGraph();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowSize.width]);

  // Generate skill graph on mount
  useEffect(() => {
    generateGraph();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSkills]);

  // Fit view when nodes change or window resizes
  useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 800 });
      }, 100);
    }
  }, [nodes, fitView]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (nodes.length > 0) {
        fitView({ padding: 0.2, duration: 300 });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [nodes, fitView]);

  const generateGraph = async () => {
    setLoading(true);
    try {
      const data = await skillGraphService.generateSkillGraph(userSkills);
      setGraphData(data);
      
      // Get container dimensions or use defaults
      const containerWidth = containerRef.current?.clientWidth || window.innerWidth - 100;
      const containerHeight = window.innerHeight < 800 ? 500 : 700;
      
      // Calculate center point
      const centerX = containerWidth / 2;
      const centerY = containerHeight / 2;
      
      // Calculate responsive radius based on container size and screen width
      const isMobile = window.innerWidth < 768;
      const baseRadius = Math.min(containerWidth, containerHeight) / (isMobile ? 3.5 : 3);
      
      // Convert to ReactFlow format with responsive positioning
      const flowNodes: Node[] = data.nodes.map((node, index) => {
        const isRole = node.type === 'role';
        const roleProximity = isRole 
          ? data.roleProximities.find(rp => `role-${rp.roleId}` === node.id)
          : null;

        // Calculate positions in a circular layout with responsive radius
        const angle = (index / data.nodes.length) * 2 * Math.PI;
        const radius = isRole ? baseRadius * 1.5 : baseRadius * 0.8;
        
        // Use responsive positioning
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        // Responsive font and padding
        const fontSize = isMobile 
          ? (isRole ? 11 : 10)
          : (isRole ? 14 : 13);
        
        const padding = isMobile ? '8px 12px' : '12px 20px';
        const minWidth = isMobile 
          ? (isRole ? 120 : 80)
          : (isRole ? 180 : 120);
        
        return {
          id: node.id,
          type: isRole ? 'default' : 'input',
          data: { 
            label: node.label,
            proximity: roleProximity?.proximity || 0
          },
          position: { x, y },
          style: {
            background: isRole 
              ? roleProximity?.color || '#3b82f6'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            border: isRole ? '3px solid #fff' : '2px solid #fff',
            borderRadius: '12px',
            padding: padding,
            fontSize: `${fontSize}px`,
            fontWeight: isRole ? '600' : '500',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: `${minWidth}px`,
            textAlign: 'center' as const,
            whiteSpace: 'normal' as const,
            wordBreak: 'break-word' as const,
            maxWidth: isMobile ? '150px' : '220px'
          }
        };
      });

      const flowEdges: Edge[] = data.edges.map(edge => {
        const strokeWidth = isMobile ? 1.5 : (2 + edge.strength * 2);
        const markerSize = isMobile ? 15 : 20;
        
        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          animated: edge.strength > 0.5,
          style: { 
            stroke: edge.strength > 0.7 ? '#10b981' : edge.strength > 0.4 ? '#f59e0b' : '#94a3b8',
            strokeWidth: strokeWidth
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edge.strength > 0.7 ? '#10b981' : edge.strength > 0.4 ? '#f59e0b' : '#94a3b8',
            width: markerSize,
            height: markerSize
          }
        };
      });

      setNodes(flowNodes);
      setEdges(flowEdges);
      
      toast.success('Skill graph generated successfully! 🎉');
    } catch (error) {
      console.error('Error generating skill graph:', error);
      toast.error('Failed to generate skill graph');
    } finally {
      setLoading(false);
    }
  };

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    // Find the corresponding role
    const roleId = node.id.replace('role-', '');
    const role = graphData?.roleProximities.find(rp => rp.roleId === roleId);
    if (role) {
      setSelectedRole(role);
    }
  }, [graphData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-lg font-medium">Analyzing your skills with AI...</p>
          <p className="text-sm text-muted-foreground">Building your career proximity map</p>
        </div>
      </div>
    );
  }

  if (!graphData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to generate skill graph</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 md:h-8 w-6 md:w-8 text-primary" />
            AI Skill Graph Visualizer
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Interactive map showing your proximity to {graphData.roleProximities.length} career roles based on {userSkills.length} skills
          </p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose} className="w-full md:w-auto">
            Close
          </Button>
        )}
      </div>

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'graph' | 'list')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="graph">🗺️ Interactive Graph</TabsTrigger>
          <TabsTrigger value="list">📊 Role Analysis</TabsTrigger>
        </TabsList>

        {/* Graph View */}
        <TabsContent value="graph" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div 
                ref={containerRef}
                className="w-full rounded-lg overflow-hidden border h-[500px] md:h-[700px]"
              >
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onNodeClick={onNodeClick}
                  connectionMode={ConnectionMode.Loose}
                  fitView
                  minZoom={0.1}
                  maxZoom={2}
                  attributionPosition="bottom-right"
                  proOptions={{ hideAttribution: true }}
                >
                  <Background 
                    variant={BackgroundVariant.Dots} 
                    gap={window.innerWidth < 768 ? 12 : 16} 
                    size={1} 
                  />
                  <Controls showInteractive={false} />
                  {window.innerWidth >= 768 && (
                    <MiniMap 
                      nodeColor={(node) => {
                        return node.type === 'input' ? '#764ba2' : '#3b82f6';
                      }}
                      maskColor="rgba(0,0,0,0.1)"
                      style={{ 
                        width: 120, 
                        height: 80 
                      }}
                    />
                  )}
                </ReactFlow>
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">🎯 Your Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Purple nodes represent your current skills</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">💼 Career Roles</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Colored nodes show potential career paths</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">🔗 Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Thicker lines = stronger skill match</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="space-y-4">
          <div className="grid gap-4">
            {graphData.roleProximities.map((role, index) => (
              <motion.div
                key={role.roleId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedRole(role)}
                  style={{ borderLeft: `4px solid ${role.color}` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{role.roleName}</CardTitle>
                        <CardDescription className="mt-1">
                          {role.proximity}% match • {role.matchedSkills.length} skills matched
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={role.proximity >= 70 ? 'default' : role.proximity >= 40 ? 'secondary' : 'outline'}
                        className="text-lg px-3 py-1"
                      >
                        {role.proximity}%
                      </Badge>
                    </div>
                    <Progress value={role.proximity} className="mt-3" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Matched Skills */}
                    {role.matchedSkills.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Matched Skills:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {role.matchedSkills.map((skill, i) => (
                            <Badge key={i} variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Skills */}
                    {role.missingSkills.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle className="h-4 w-4 text-orange-600" />
                          <span className="text-sm font-medium">Skills to Learn:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {role.missingSkills.map((skill, i) => (
                            <Badge key={i} variant="outline" className="text-orange-600 border-orange-200">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Recommendations */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">AI Recommendations:</span>
                      </div>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {role.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Selected Role Detail Modal */}
      <AnimatePresence>
        {selectedRole && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedRole(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] md:max-h-[80vh] overflow-y-auto"
            >
              <div className="p-4 md:p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-bold">{selectedRole.roleName}</h3>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">Career Role Analysis</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedRole(null)}>
                    ✕
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <div className="flex-1">
                    <Progress value={selectedRole.proximity} className="h-3" />
                  </div>
                  <Badge className="text-lg md:text-xl px-4 py-2 justify-center" style={{ backgroundColor: selectedRole.color }}>
                    {selectedRole.proximity}%
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs md:text-sm">Skills Matched</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl md:text-3xl font-bold text-green-600">{selectedRole.matchedSkills.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs md:text-sm">Skills Needed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl md:text-3xl font-bold text-orange-600">{selectedRole.missingSkills.length}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      Your Matching Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRole.matchedSkills.map((skill, i) => (
                        <Badge key={i} variant="secondary" className="bg-green-50 text-green-700">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Target className="h-5 w-5 text-orange-600" />
                      Skills to Develop
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRole.missingSkills.map((skill, i) => (
                        <Badge key={i} variant="outline" className="border-orange-200 text-orange-600">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                      AI-Powered Next Steps
                    </h4>
                    <div className="space-y-2">
                      {selectedRole.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                          <Award className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Wrapper component with ReactFlowProvider
export default function SkillGraphVisualizer(props: SkillGraphVisualizerProps) {
  return (
    <ReactFlowProvider>
      <SkillGraphVisualizerInner {...props} />
    </ReactFlowProvider>
  );
}
