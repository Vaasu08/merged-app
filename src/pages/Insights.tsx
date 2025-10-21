import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { ModeToggle } from '@/components/mode-toggle';
import { Header } from '@/components/Header';
import { 
  TrendingUp, BarChart3, DollarSign, Users, ArrowUp, ArrowDown, 
  Sparkles, Zap, Target, Award, Globe, Rocket, Star, CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, BarChart, Bar } from 'recharts';
import { jobDemandTrends, skillTrends, salaryTrends, chartConfig } from '@/data/trendsData';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useInView as useIntersectionObserver } from 'react-intersection-observer';

const Insights = () => {
  const topSkills = skillTrends
    .sort((a, b) => b.demand - a.demand)
    .slice(0, 6);

  const fastestGrowingSkills = skillTrends
    .sort((a, b) => b.growth - a.growth)
    .slice(0, 5);

  const highestPaidCareers = salaryTrends
    .sort((a, b) => b.senior - a.senior)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="container mx-auto max-w-7xl space-y-12 py-8 px-4 relative z-10">
        <Header />

        {/* Header */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center space-y-8"
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 backdrop-blur-sm rounded-full text-primary text-sm font-medium border border-primary/20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <BarChart3 className="h-4 w-4" />
            </motion.div>
            Career Intelligence Dashboard
          </motion.div>
          
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent"
          >
            India Tech Market Insights
          </motion.h1>
          
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
          >
            Data-driven insights from India's thriving tech ecosystem to help you make informed career decisions.
          </motion.p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              icon: TrendingUp,
              title: "Avg. Growth Rate",
              value: "+9.0%",
              color: "primary",
              bgColor: "bg-primary/10",
              iconColor: "text-primary"
            },
            {
              icon: DollarSign,
              title: "Avg. Senior Salary",
              value: "₹18.5L",
              color: "success",
              bgColor: "bg-success/10",
              iconColor: "text-success"
            },
            {
              icon: Users,
              title: "Active Job Postings",
              value: "2.1M+",
              color: "accent",
              bgColor: "bg-accent/10",
              iconColor: "text-accent"
            },
            {
              icon: Zap,
              title: "Hot Skills",
              value: "12",
              color: "destructive",
              bgColor: "bg-destructive/10",
              iconColor: "text-destructive"
            }
          ].map((metric, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group"
            >
              <Card className="bg-gradient-card border-border/50 shadow-soft hover:shadow-large transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`p-3 ${metric.bgColor} rounded-xl`}
                    >
                      <metric.icon className={`h-6 w-6 ${metric.iconColor}`} />
                    </motion.div>
                    <div>
                      <p className="text-sm text-muted-foreground">{metric.title}</p>
                      <motion.p
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                        viewport={{ once: true }}
                        className="text-2xl font-bold text-foreground"
                      >
                        {metric.value}
                      </motion.p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Job Demand Trends */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          whileHover={{ y: -5 }}
        >
          <Card className="bg-gradient-card border-border/50 shadow-soft hover:shadow-large transition-all duration-300">
            <CardHeader>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex items-center gap-3"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-2 bg-primary/10 rounded-lg"
                >
                  <TrendingUp className="h-5 w-5 text-primary" />
                </motion.div>
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground">Job Demand Trends - India (2024)</CardTitle>
                  <CardDescription>Monthly job posting trends across different tech career paths in India</CardDescription>
                </div>
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <LineChart data={jobDemandTrends}>
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line dataKey="Frontend Developer" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line dataKey="Backend Developer" stroke="hsl(var(--accent))" strokeWidth={2} />
                    <Line dataKey="Full Stack Developer" stroke="hsl(var(--success))" strokeWidth={2} />
                    <Line dataKey="Data Scientist" stroke="hsl(var(--destructive))" strokeWidth={2} />
                    <Line dataKey="DevOps Engineer" stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
                    <Line dataKey="Mobile Developer" stroke="hsl(var(--secondary))" strokeWidth={2} />
                    <Line dataKey="ML Engineer" stroke="hsl(var(--popover))" strokeWidth={2} />
                  </LineChart>
                </ChartContainer>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Skills by Demand */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
          >
            <Card className="bg-gradient-card border-border/50 shadow-soft hover:shadow-large transition-all duration-300">
              <CardHeader>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="p-2 bg-primary/10 rounded-lg"
                  >
                    <Target className="h-5 w-5 text-primary" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl font-bold text-foreground">Top Skills by Demand</CardTitle>
                    <CardDescription>Most in-demand skills in India's tech market</CardDescription>
                  </div>
                </motion.div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topSkills.map((skill, index) => (
                    <motion.div
                      key={skill.skill}
                      initial={{ x: -20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ x: 5, scale: 1.02 }}
                      className="flex items-center justify-between p-4 bg-background rounded-xl border border-border/50 hover:border-primary/20 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                          className="w-10 h-10 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary border border-primary/20"
                        >
                          {index + 1}
                        </motion.div>
                        <div>
                          <p className="font-semibold text-foreground">{skill.skill}</p>
                          <p className="text-sm text-muted-foreground">{skill.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <motion.p
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                          viewport={{ once: true }}
                          className="font-bold text-foreground text-lg"
                        >
                          {skill.demand}%
                        </motion.p>
                        <div className="flex items-center gap-1 text-xs text-success">
                          <ArrowUp className="h-3 w-3" />
                          +{skill.growth}%
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Fastest Growing Skills */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
          >
            <Card className="bg-gradient-card border-border/50 shadow-soft hover:shadow-large transition-all duration-300">
              <CardHeader>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="p-2 bg-success/10 rounded-lg"
                  >
                    <TrendingUp className="h-5 w-5 text-success" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl font-bold text-foreground">Fastest Growing Skills</CardTitle>
                    <CardDescription>Skills with the highest growth rate in India</CardDescription>
                  </div>
                </motion.div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fastestGrowingSkills.map((skill, index) => (
                    <motion.div
                      key={skill.skill}
                      initial={{ x: 20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ x: -5, scale: 1.02 }}
                      className="flex items-center justify-between p-4 bg-background rounded-xl border border-border/50 hover:border-success/20 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: -5 }}
                          transition={{ duration: 0.2 }}
                          className="w-10 h-10 bg-gradient-to-r from-success/20 to-success/10 rounded-full flex items-center justify-center text-sm font-bold text-success border border-success/20"
                        >
                          {index + 1}
                        </motion.div>
                        <div>
                          <p className="font-semibold text-foreground">{skill.skill}</p>
                          <p className="text-sm text-muted-foreground">{skill.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-success font-bold">
                          <ArrowUp className="h-3 w-3" />
                          +{skill.growth}%
                        </div>
                        <p className="text-sm text-muted-foreground">{skill.demand}% demand</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Salary Trends */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">Salary Ranges by Career Level (INR)</CardTitle>
            <CardDescription>Average salary ranges across different experience levels in India</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[400px]">
              <BarChart data={salaryTrends}>
                <XAxis 
                  dataKey="career" 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="junior" fill="hsl(var(--muted))" name="Junior (0-2 years) - ₹L" />
                <Bar dataKey="mid" fill="hsl(var(--primary))" name="Mid-level (3-5 years) - ₹L" />
                <Bar dataKey="senior" fill="hsl(var(--accent))" name="Senior (6+ years) - ₹L" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Highest Paid Careers */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground">Highest Paid Careers (INR)</CardTitle>
            <CardDescription>Top earning potential by career path in India</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {highestPaidCareers.map((career, index) => (
                <div key={career.career} className="flex items-center justify-between p-4 bg-background rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-lg font-bold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{career.career}</p>
                      <p className="text-sm text-muted-foreground">Senior Level</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">₹{career.senior}L</p>
                    <div className="flex items-center gap-1 text-xs text-success">
                      <ArrowUp className="h-3 w-3" />
                      +{career.growth}% growth
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0">
            <motion.div
              className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"
              animate={{
                x: [0, 50, 0],
                y: [0, -30, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.div
              className="absolute bottom-10 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl"
              animate={{
                x: [0, -50, 0],
                y: [0, 30, 0],
                scale: [1, 0.9, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>
          
          <Card className="bg-gradient-primary text-white border-0 shadow-2xl relative z-10">
            <CardContent className="p-12 text-center">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-4 w-4" />
                </motion.div>
                Ready to Transform Your Career?
              </motion.div>
              
              <motion.h3
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold mb-6"
              >
                Start Your Journey Today
              </motion.h3>
              
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-white/80 mb-8 max-w-3xl mx-auto text-lg leading-relaxed"
              >
                Use our AI-powered career advisor to discover personalized career paths based on your skills and these industry insights.
              </motion.p>
              
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-50 font-bold px-8 py-4 rounded-xl shadow-lg group">
                    <Link to="/" className="flex items-center gap-2">
                      <Rocket className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                      Get Career Recommendations
                    </Link>
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-primary font-bold px-6 py-4 rounded-xl backdrop-blur-sm transition-all duration-300 shadow-lg [text-shadow:_0_1px_2px_rgb(0_0_0_/_80%)]">
                    <Link to="/news" className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Explore Job News
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Insights;
