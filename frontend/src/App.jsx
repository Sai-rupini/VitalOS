import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip 
} from 'recharts';
import { 
  Activity, Thermometer, User, ArrowRight, CheckCircle, 
  ChevronLeft, Clipboard, Info, ShieldCheck, Zap,
  Fingerprint, Settings2, RefreshCw, Star, Heart,
  Sparkles, Brain, Gauge, Compass, Target, Gem,
  Droplet, Stethoscope, TrendingDown, AlertCircle
} from 'lucide-react';
import { useRef } from 'react';

// --- HELPER COMPONENTS ---

const Tooltip = ({ text }) => (
  <div className="group relative inline-block ml-2">
    <Info size={14} className="text-gray-400 cursor-help transition-colors group-hover:text-blue-600" />
    <div className="invisible group-hover:visible absolute z-50 w-56 p-3 mt-2 text-xs leading-relaxed text-gray-700 bg-white rounded-xl shadow-lg border border-gray-200 -left-24 top-full transition-all duration-200 opacity-0 group-hover:opacity-100">
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-t border-l border-gray-200 rotate-45"></div>
      {text}
    </div>
  </div>
);

const InputGroup = ({ label, name, icon: IconComponent, value, onChange, min, max, info, placeholder }) => {
  const isOut = value > 0 && (value < min || value > max);
  
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-600 flex items-center">
          <IconComponent size={16} className="mr-2 text-blue-500" /> {label}
          <Tooltip text={info} />
        </label>
        {value > 0 && (
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
              isOut ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
            }`}
          >
            {isOut ? 'Outside Range' : 'Optimal'}
          </motion.span>
        )}
      </div>
 
      <input 
        type="number" 
        name={name} 
        value={value === 0 ? "" : value} 
        onChange={onChange} 
        className={`w-full bg-white border rounded-xl px-4 py-3 outline-none transition-all text-gray-700 font-bold ${
          isOut ? 'border-amber-300 focus:ring-amber-200' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-200'
        } focus:ring-2`}
        placeholder={placeholder || "0.0"}
        step="any"
      />
    </div>
  );
};

// --- MAIN APPLICATION ---

export default function App() {
  const [view, setView] = useState('home'); 
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const reportRef = useRef(null);
  const roadmapRef = useRef(null);
  
  const [vitals, setVitals] = useState({
    preg: 0, glucose: 80, bp: 70, skin: 20, insulin: 80, bmi: 25.0, pedigree: 0.5, age: 30
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const val = value === "" ? 0 : parseFloat(value);
    setVitals(prev => ({ ...prev, [name]: val }));
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const payload = { values: Object.values(vitals) };
      const response = await axios.post('http://127.0.0.1:5000/predict', payload);
      setResult(response.data);
      setView('result');
    } catch (err) {
      console.error("API Error:", err);
      alert("Backend Connection Failed. Ensure Flask is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  // --- FEATURE: CLINICAL WHY (LOCAL EXPLAINER) LOGIC ---
  const clinicalWhy = useMemo(() => {
    if (!result) return null;
    
    const drivers = [
      { name: 'Glucose', val: vitals.glucose, base: 100, unit: 'mg/dL' },
      { name: 'BMI', val: vitals.bmi, base: 22, unit: 'kg/m²' },
      { name: 'Insulin', val: vitals.insulin, base: 30, unit: 'mu U/ml' }
    ];

    const topDriver = drivers.reduce((prev, current) => 
      ((current.val / current.base) > (prev.val / prev.base)) ? current : prev
    );

    const percentAbove = Math.round(((topDriver.val - topDriver.base) / topDriver.base) * 100);
    
    return {
      title: topDriver.name,
      impact: percentAbove > 0 ? `${percentAbove}% above baseline` : 'Primary Metric',
      description: `Your ${topDriver.name} is the strongest weight in this prediction. While other factors vary, the model identifies this as the critical surveillance point.`
    };
  }, [result, vitals]);

  const importanceData = useMemo(() => [
    { name: 'Glucose', value: Math.abs(vitals.glucose - 100) },
    { name: 'BMI', value: Math.abs(vitals.bmi - 20) * 2 },
    { name: 'Age', value: vitals.age / 1.5 },
    { name: 'Genetics', value: vitals.pedigree * 40 },
  ].sort((a, b) => b.value - a.value), [vitals]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 text-gray-800 font-sans selection:bg-blue-200 overflow-x-hidden">
      
      {/* Top Left Logo */}
      <div className="fixed top-6 left-6 z-50 flex items-center gap-2">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-xl shadow-md">
          <Stethoscope size={24} className="text-white" />
        </div>
        <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">vital.os</span>
      </div>

      <AnimatePresence mode="wait">
        
        {/* VIEW 1: LANDING PAGE */}
        {view === 'home' && (
          <motion.div 
            key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="max-w-6xl mx-auto px-6 pt-24 pb-12 flex flex-col items-center text-center relative"
          >
            <div className="absolute top-1/4 -left-40 w-96 h-96 bg-blue-200/40 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-[120px] pointer-events-none" />
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-8"
            >
              <Gem size={14} /> Ensemble Tournament Logic v2.5
            </motion.div>
            
            <h1 className="text-7xl md:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-r from-blue-800 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Precision <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text">Health Intelligence</span>
            </h1>
            
            <p className="max-w-2xl text-lg text-gray-600 mb-6 leading-relaxed">
              Consensus-based diagnostics. We run your clinical biomarkers through a tournament of multiple AI models to ensure the highest predictive accuracy.
            </p>
            
            <button 
              onClick={() => setView('wizard')} 
              className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-5 px-10 rounded-2xl transition-all hover:scale-105 shadow-lg shadow-blue-500/30 group"
            >
              Begin Multi-Model Scan 
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}

        {/* VIEW 2: WIZARD */}
        {view === 'wizard' && (
          <motion.div 
            key="wizard" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6"
          >
            <div className="bg-white border border-gray-200 max-w-2xl w-full p-10 rounded-[2.5rem] relative overflow-hidden shadow-xl">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
                <motion.div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600" animate={{ width: `${(step/3)*100}%` }} />
              </div>

              <div className="mb-10 text-center">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2 uppercase tracking-tighter italic">
                   Clinical Intake
                </h2>
                <p className="text-gray-400 text-[10px] font-black mt-1 tracking-[0.3em] uppercase">Phase {step} of 3</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[250px]">
                {step === 1 && (
                  <>
                    <InputGroup 
                      label="Age" name="age" value={vitals.age} onChange={handleChange} icon={User} 
                      info="Risk factors often increase with age." 
                      min={1} max={65} 
                    />
                    <InputGroup 
                      label="BMI" name="bmi" value={vitals.bmi} onChange={handleChange} icon={Activity} 
                      info="Healthy BMI range is 18.5 to 25." 
                      min={18.5} max={25} 
                    />
                  </>
                )}

                {step === 2 && (
                  <>
                    <InputGroup 
                      label="Glucose" name="glucose" value={vitals.glucose} onChange={handleChange} icon={Thermometer} 
                      info="Fasting glucose should be between 70-99 mg/dL. 126+ indicates potential diabetes." 
                      min={70} max={100} 
                    />
                    <InputGroup 
                      label="Blood Pressure" name="bp" value={vitals.bp} onChange={handleChange} icon={Activity} 
                      info="Diastolic pressure (lower number). Normal is 60-80 mmHg." 
                      min={60} max={80} 
                    />
                    <InputGroup 
                      label="Insulin" name="insulin" value={vitals.insulin} onChange={handleChange} icon={Clipboard} 
                      info="Normal 2-hour serum insulin is typically under 160 mIU/L." 
                      min={15} max={160} 
                    />
                  </>
                )}

                {step === 3 && (
                  <>
                    <InputGroup 
                      label="Pregnancies" name="preg" value={vitals.preg} onChange={handleChange} icon={User} 
                      info="Number of pregnancies." 
                      min={0} max={3} 
                    />
                    <InputGroup 
                      label="Diabetes Pedigree" name="pedigree" value={vitals.pedigree} onChange={handleChange} icon={Info} 
                      info="Genetic risk score. Lower is better (typically < 0.5)." 
                      min={0} max={0.5} 
                    />
                    <InputGroup 
                      label="Skin Thickness" name="skin" value={vitals.skin} onChange={handleChange} icon={Activity} 
                      info="Triceps skin fold thickness (mm). Normal for adults is ~10-30mm." 
                      min={10} max={30} 
                    />
                  </>
                )}
              </div>

              <div className="mt-12 flex justify-between">
                <button onClick={() => step === 1 ? setView('home') : setStep(s => s-1)} className="text-gray-500 hover:text-gray-700 p-2">
                  <ChevronLeft size={20} />
                </button>
                {step < 3 ? (
                  <button onClick={() => setStep(s => s+1)} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl transition-all">
                    Next Phase
                  </button>
                ) : (
                  <button onClick={handlePredict} disabled={loading} className="bg-green-600 text-white font-bold py-3 px-8 rounded-xl transition-all">
                    {loading ? "Processing..." : "Run Analysis"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 3: RESULT DASHBOARD */}
        {view === 'result' && result && (
          <motion.div 
            key="result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto px-6 py-16 space-y-6"
          >
            <div ref={reportRef} id="capture-area" className="space-y-6 bg-transparent p-4">
              <div className="flex justify-between items-end mb-4 px-4">
                <div>
                  <h2 className="text-2xl font-black italic tracking-tighter uppercase text-gray-800">Diagnostic_Report</h2>
                  <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">UID: {Math.random().toString(36).substr(2, 9)}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-full uppercase">Verified by Vital.OS</span>
                </div>
              </div>
            

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Risk Gauge */}
                <div className="bg-white border border-gray-200 p-8 rounded-[2.5rem] flex flex-col items-center shadow-lg">
                  <h3 className="text-lg font-semibold mb-6 self-start text-gray-600 flex items-center gap-2"><Target size={16} /> Consensus Risk</h3>
                  <div className="h-52 w-full relative">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={[{v: result.probability}, {v: 100-result.probability}]} innerRadius={65} outerRadius={85} startAngle={210} endAngle={-30} paddingAngle={0} dataKey="v">
                          <Cell fill={result.probability > 50 ? '#f59e0b' : '#10b981'} stroke="none" />
                          <Cell fill="#f3f4f6" stroke="none" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center mt-4">
                      <span className="text-5xl font-black text-gray-800">{Math.round(result.probability)}%</span>
                      <span className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">Confidence</span>
                    </div>
                  </div>
                  <div className={`mt-6 w-full py-3 rounded-2xl text-center font-bold text-sm ${result.probability > 50 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                    {result.probability > 50 ? 'HIGH RISK' : 'LOW RISK'}
                  </div>
                </div>

                {/* 2. DYNAMIC GOAL SIMULATION (WHAT-IF) */}
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4 text-indigo-100">
                      <TrendingDown size={18} />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Goal Simulation</span>
                    </div>
                    <h4 className="text-2xl font-bold mb-2 italic tracking-tighter leading-tight">Personalized Recovery Goal</h4>
                    <p className="text-indigo-100 text-xs leading-relaxed opacity-80 mb-4">
                      Reducing Glucose to <span className="font-bold text-white underline">{result.target_metrics.glucose}</span> and BMI to <span className="font-bold text-white underline">{result.target_metrics.bmi}</span> drops your risk by:
                    </p>
                    <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300">
                      -{result.improvement_diff}%
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-60">
                      <span>Current</span>
                      <span>Target</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div initial={{ width: "100%" }} animate={{ width: `${(result.target_probability / result.probability) * 100}%` }} className="h-full bg-green-400"/>
                    </div>
                    <button onClick={() => { setView('home'); setStep(1); setResult(null); }} className="w-full py-3 mt-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                      Restart Analysis
                    </button>
                  </div>
                </div>

                {/* 3. Ensemble Status */}
                <div className="bg-white border border-gray-200 p-8 rounded-[2.5rem] shadow-lg">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 mb-6 uppercase italic tracking-tighter">
                    <Sparkles size={18} className="text-blue-600" /> Ensemble Status
                  </h3>
                  <div className="space-y-3">
                    {result.results.map((res, index) => (
                      <div key={index} className="flex justify-between items-center p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-all">
                        <span className="text-xs font-bold text-gray-700 flex items-center gap-2"><Brain size={12} className="text-blue-600" /> {res.model_name}</span>
                        <span className="text-[10px] font-mono text-gray-500 font-bold">{res.probability}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Neural Factors Chart */}
                <div className="bg-white border border-gray-200 p-8 rounded-[2.5rem] md:col-span-3 h-64 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2 uppercase italic tracking-tighter"><Activity size={18} className="text-blue-600" /> Biometric Influence</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={importanceData}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={11} width={100} tickLine={false} axisLine={false} />
                      <Bar dataKey="value" fill="url(#gradientBar)" radius={[0, 6, 6, 0]} barSize={24} />
                      <defs>
                        <linearGradient id="gradientBar" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* ROADMAP UNLOCK TILE */}
                <motion.div 
                  whileHover={{ scale: 1.01 }} onClick={() => setView('roadmap')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 p-10 rounded-[3rem] md:col-span-3 mt-6 cursor-pointer relative overflow-hidden group shadow-xl"
                >
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6 text-center md:text-left">
                      <div className="p-4 bg-white/20 rounded-3xl">
                        <Compass size={48} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Generate Roadmap</h3>
                        <p className="text-blue-100 text-sm mt-1">Cross-referencing CDC indicators and Precision Diet protocols.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all shadow-lg">
                      Access Deep-Dive <ArrowRight size={18} />
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 4: CINEMATIC ROADMAP */}
        {view === 'roadmap' && result && (
          <motion.div 
            key="roadmap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="min-h-screen bg-gray-50 p-6 md:p-12 overflow-y-auto"
          >
            <div ref={roadmapRef} className="max-w-5xl mx-auto">
              <div className="flex justify-between items-center mb-16">
                <button onClick={() => setView('result')} className="px-6 py-3 bg-white border border-gray-200 rounded-2xl text-[10px] font-black tracking-widest text-gray-600 hover:text-gray-800 transition-all flex items-center gap-2 shadow-sm">
                  <ChevronLeft size={16} /> ANALYTICS
                </button>
                <div className="text-right">
                  <p className="text-blue-600 font-mono text-[10px] tracking-[0.3em] uppercase">vital.os · Clinical Protocol</p>
                  <h2 className="text-3xl font-black text-gray-800 italic tracking-tighter uppercase leading-none">Patient_Roadmap</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-4 space-y-6">
                  <div className="bg-white border border-gray-200 p-10 rounded-[3rem] relative overflow-hidden shadow-lg border-t-8 border-t-blue-500">
                    <p className="text-gray-400 text-[10px] font-black uppercase mb-4 tracking-[0.2em]">Clinical Status</p>
                    <div className="text-7xl font-black text-gray-800 mb-2 tracking-tighter">{Math.round(result.probability)}%</div>
                    <div className={`text-[10px] font-black px-4 py-2 rounded-xl inline-block tracking-widest ${result.probability > 75 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {result.probability > 75 ? 'URGENT ACTION' : 'PREVENTATIVE'}
                    </div>
                    <div className="mt-10 pt-10 border-t border-gray-100">
                      <h4 className="text-[10px] font-black text-blue-600 uppercase mb-4 tracking-widest">Evidence Match</h4>
                      <p className="text-sm text-gray-600 leading-relaxed italic font-bold">
                        {result.insights.fact}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-8 space-y-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-px flex-grow bg-gray-200"></div>
                    <span className="text-[10px] font-black text-gray-400 tracking-[0.3em] uppercase">Intervention Sequence</span>
                    <div className="h-px flex-grow bg-gray-200"></div>
                  </div>
                  
                  {/* Step 1: Diet */}
                  <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                    className="flex gap-8 bg-white border border-gray-200 p-10 rounded-[3rem] hover:shadow-lg transition-all border-l-8 border-l-emerald-500"
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-500">
                      <Activity size={32} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">01. Precision Nutrition</h4>
                      <p className="text-2xl text-gray-800 font-bold mb-4 leading-tight italic uppercase tracking-tighter">{result.insights.diet}</p>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-black text-gray-400">LOW_GLYCEMIC</span>
                        <span className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-black text-gray-400">STABLE_METABOLISM</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Step 2: Lifestyle */}
                  <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                    className="flex gap-8 bg-white border border-gray-200 p-10 rounded-[3rem] hover:shadow-lg transition-all border-l-8 border-l-blue-500"
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-500">
                      <Zap size={32} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3">02. Behavioral Pivot</h4>
                      <p className="text-xl text-gray-700 leading-relaxed font-bold italic">
                        {result.insights.habit}
                      </p>
                    </div>
                  </motion.div>

                  <div className="p-8 bg-gradient-to-r from-blue-50 to-transparent rounded-[2.5rem] border border-blue-100 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest opacity-60">Engine: KNN-Synthesis v2.5 Protocol Active</span>
                    <Heart size={20} className="text-red-500 fill-red-500 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}