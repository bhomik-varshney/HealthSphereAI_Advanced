import { useState, useEffect } from 'react';
import {
  Upload,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  FileText,
  Loader2,
  X,
  Wind,
  Zap,
  Brain,
  Shield,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { predictXRayDisease } from '@/services/api';

interface XRayResult {
  primary_diagnosis: string;
  confidence: number;
  is_normal: boolean;
  probabilities: { [key: string]: number };
  warning_message: string | null;
}

export default function ScanTestAI() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<XRayResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayedText, setDisplayedText] = useState<string>("");

  const fullText = "Clinical-grade chest X-ray diagnostic assistant powered by advanced deep learning technology";

  useEffect(() => {
    let index = 0;
    let typingTimer: NodeJS.Timeout | null = null;
    let delayTimer: NodeJS.Timeout | null = null;

    const startTyping = () => {
      index = 0;
      typingTimer = setInterval(() => {
        if (index <= fullText.length) {
          setDisplayedText(fullText.slice(0, index));
          index++;
        } else {
          if (typingTimer) clearInterval(typingTimer);
          // Wait 2 seconds before restarting
          delayTimer = setTimeout(() => {
            startTyping();
          }, 2000);
        }
      }, 30);
    };

    startTyping();

    return () => {
      if (typingTimer) clearInterval(typingTimer);
      if (delayTimer) clearTimeout(delayTimer);
    };
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      setSelectedFile(file);
      setError(null);
      setResult(null);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRunDiagnostics = async () => {
    if (!selectedFile) {
      setError('Please select an X-ray image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const predictionResult = await predictXRayDisease(selectedFile);
      setResult(predictionResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process X-ray image');
    } finally {
      setLoading(false);
    }
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const getDiagnosisColor = (diagnosis: string): string => {
    switch (diagnosis.toLowerCase()) {
      case 'normal':
        return 'text-green-600';
      case 'covid':
        return 'text-red-600';
      case 'pneumonia':
        return 'text-orange-600';
      case 'lung opacity':
        return 'text-yellow-600';
      default:
        return 'text-slate-600';
    }
  };

  const getDiagnosisIcon = (diagnosis: string) => {
    const isNormal = diagnosis.toLowerCase() === 'normal';
    return isNormal ? (
      <CheckCircle2 className="w-8 h-8 text-green-600" />
    ) : (
      <AlertCircle className="w-8 h-8 text-red-600" />
    );
  };

  /**
   * Format percentage value - handles both raw probabilities (0-1) and percentages (0-100)
   * If value is > 1, treat it as already a percentage; otherwise multiply by 100
   */
  const formatPercentage = (value: number): string => {
    if (value > 1) {
      // Already a percentage
      return Math.min(value, 100).toFixed(1);
    } else {
      // Raw probability, convert to percentage
      return (Math.min(value, 1) * 100).toFixed(1);
    }
  };

  /**
   * Get bar width percentage - ensures it doesn't exceed 100% and handles edge cases
   */
  const getBarWidth = (value: number): string => {
    let percentage = value;
    if (value > 1) {
      // Value is already a percentage
      percentage = Math.min(value, 100) / 100;
    } else {
      // Value is a raw probability
      percentage = Math.min(value, 1);
    }
    return `${percentage * 100}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center justify-center gap-3 mb-6 px-4 py-2 bg-gradient-to-r from-teal-100 to-emerald-100 rounded-full border border-teal-200">
            <div className="p-1.5 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full">
              <Wind className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">AI-Powered Diagnostics</span>
          </div>
          <h1 className="w-full text-5xl md:text-6xl font-bold text-foreground mb-2 bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 pb-2">
            Vital Lung AI
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed h-20 flex items-center">
            {displayedText}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div>
            <Card className="h-full border-0 shadow-lg bg-white rounded-2xl overflow-hidden">
              <CardHeader className="border-b-2 border-teal-200 bg-gradient-to-r from-teal-100 via-emerald-100 to-cyan-100 py-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-teal-700">Upload X-Ray Image</CardTitle>
                    <CardDescription className="font-semibold text-teal-600">JPG or PNG format, max 10MB</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
              {!previewUrl ? (
                <label className="flex items-center justify-center w-full h-64 px-4 transition bg-slate-50 border-2 border-dashed rounded-2xl appearance-none cursor-pointer border-primary/30 hover:bg-primary/5 hover:border-primary group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">Click to select X-ray</p>
                    <p className="text-xs text-muted-foreground">or drag and drop</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </label>
              ) : (
                <div className="relative space-y-3">
                  <div className="flex justify-center max-h-96 overflow-auto rounded-xl border border-slate-200 bg-white shadow-md">
                    <img
                      src={previewUrl}
                      alt="X-ray preview"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Image Preview
                    </p>
                    {selectedFile && (
                      <span className="text-xs text-muted-foreground bg-white px-2 py-1 rounded">
                        {selectedFile.name}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleClearImage}
                      variant="outline"
                      className="flex-1"
                      size="lg"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                    <Button
                      onClick={handleRunDiagnostics}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Run AI Diagnostics
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {loading ? (
              <Card className="flex items-center justify-center min-h-96 border-0 shadow-lg bg-gradient-to-br from-teal-50/50 to-emerald-50/50 rounded-2xl overflow-hidden">
                <CardContent className="text-center py-12">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-teal-100 mb-4">
                    <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
                  </div>
                  <p className="text-muted-foreground text-center max-w-xs text-lg font-medium">
                    Analyzing your X-ray image with advanced AI diagnostics...
                  </p>
                </CardContent>
              </Card>
            ) : !result ? (
              <Card className="h-full flex items-center justify-center min-h-96 border-0 shadow-lg bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl overflow-hidden">
                <CardContent className="text-center py-12">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 mb-4">
                    <FileText className="h-8 w-8 text-slate-600" />
                  </div>
                  <p className="text-muted-foreground text-center max-w-xs text-lg font-medium">
                    Upload an X-ray image and run diagnostics to see results
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Success Card */}
                <Card className="border-0 shadow-lg bg-white rounded-2xl overflow-hidden">
                  <CardHeader className="border-b-2 border-teal-200 bg-gradient-to-r from-teal-100 via-emerald-100 to-cyan-100 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl">
                        <BarChart3 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-teal-700">Diagnostic Results</CardTitle>
                        <CardDescription className="font-semibold text-teal-600">AI prediction and confidence metrics</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    {/* Primary Diagnosis */}
                    <div className="rounded-lg bg-secondary/50 p-4">
                      <div className="flex items-start gap-3">
                        {getDiagnosisIcon(result.primary_diagnosis)}
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground mb-1">Primary Diagnosis</p>
                          <p className={`text-2xl font-bold ${getDiagnosisColor(result.primary_diagnosis)}`}>
                            {result.primary_diagnosis}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Confidence Score */}
                    <div className="rounded-lg bg-secondary/50 p-4\">
                      <p className="text-sm text-muted-foreground mb-2">AI Confidence</p>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-primary">
                          {formatPercentage(result.confidence)}%
                        </span>
                      </div>
                      <div className="mt-3 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary to-blue-500 h-2 rounded-full transition-all"
                          style={{ width: getBarWidth(result.confidence) }}
                        />
                      </div>
                    </div>

                    {/* Probability Breakdown */}
                    <div className="rounded-lg bg-secondary/50 p-4 overflow-hidden\">
                      <p className="text-sm text-muted-foreground mb-3">Disease Probability Breakdown</p>
                      <div className="space-y-3">
                        {Object.entries(result.probabilities).map(([disease, probability]) => (
                          <div key={disease} className="w-full">
                            <div className="flex justify-between items-center mb-1 gap-2">
                              <span className="text-sm text-foreground truncate">{disease}</span>
                              <span className="text-sm font-semibold text-foreground flex-shrink-0">
                                {formatPercentage(probability)}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-primary to-blue-500 h-2 rounded-full transition-all"
                                style={{ width: getBarWidth(probability) }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Warning/Success Alerts */}
                    {!result.is_normal && result.warning_message && (
                      <Alert variant="destructive" className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertTitle className="text-red-800">Medical Alert</AlertTitle>
                        <AlertDescription className="text-red-700">{result.warning_message}</AlertDescription>
                      </Alert>
                    )}

                    {result.is_normal && (
                      <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Result Status</AlertTitle>
                        <AlertDescription className="text-green-700">
                          The X-ray appears to be within normal limits
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mt-6 border-red-200 bg-red-50 rounded-2xl">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Error</AlertTitle>
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {/* How It Works Section */}
        <Card className="mt-16 border-0 shadow-lg bg-white rounded-2xl overflow-hidden">
          <CardHeader className="border-b-2 border-teal-200 bg-gradient-to-r from-teal-100 via-emerald-100 to-cyan-100 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl">
                <Info className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-teal-700">How It Works?</CardTitle>
                <CardDescription className="font-semibold text-teal-600">Step-by-step AI diagnostic process</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {/* Step 1 */}
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                    <Upload className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-blue-700">Step 1</span>
                </div>
                <h4 className="font-bold text-foreground mb-2">Upload Image</h4>
                <p className="text-sm text-muted-foreground">Select and upload a chest X-ray image in JPG or PNG format</p>
              </div>

              {/* Step 2 */}
              <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-6 border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-purple-700">Step 2</span>
                </div>
                <h4 className="font-bold text-foreground mb-2">AI Analysis</h4>
                <p className="text-sm text-muted-foreground">Advanced deep learning model analyzes the X-ray in real-time</p>
              </div>

              {/* Step 3 */}
              <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 border-2 border-amber-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-amber-700">Step 3</span>
                </div>
                <h4 className="font-bold text-foreground mb-2">Generate Report</h4>
                <p className="text-sm text-muted-foreground">Generates comprehensive diagnostic predictions with confidence scores</p>
              </div>

              {/* Step 4 */}
              <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-6 border-2 border-emerald-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-emerald-700">Step 4</span>
                </div>
                <h4 className="font-bold text-foreground mb-2">Review Results</h4>
                <p className="text-sm text-muted-foreground">Review detailed probability breakdown and clinical recommendations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What It Can Detect Section */}
        <Card className="mt-8 border-0 shadow-lg bg-white rounded-2xl overflow-hidden">
          <CardHeader className="border-b-2 border-teal-200 bg-gradient-to-r from-teal-100 via-emerald-100 to-cyan-100 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-teal-700">What It Can Detect?</CardTitle>
                <CardDescription className="font-semibold text-teal-600">Conditions identified by Vital Lung AI</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* COVID */}
              <div className="rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 p-6 border-2 border-red-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-bold text-red-700">COVID-19</h4>
                </div>
                <p className="text-sm text-muted-foreground">Detects pulmonary involvement and characteristic CT/X-ray patterns associated with COVID-19 infection</p>
              </div>

              {/* Pneumonia */}
              <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-6 border-2 border-orange-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg">
                    <Wind className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-bold text-orange-700">Pneumonia</h4>
                </div>
                <p className="text-sm text-muted-foreground">Identifies bacterial, viral, and fungal pneumonia patterns including consolidation and infiltrates</p>
              </div>

              {/* Lung Opacity */}
              <div className="rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 p-6 border-2 border-yellow-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-bold text-yellow-700">Lung Opacity</h4>
                </div>
                <p className="text-sm text-muted-foreground">Detects abnormal opacities indicating nodules, masses, or other pathological areas in lung tissue</p>
              </div>

              {/* Normal */}
              <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 border-2 border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-bold text-green-700">Normal</h4>
                </div>
                <p className="text-sm text-muted-foreground">Confirms healthy lung fields with no abnormal findings or pathological indicators detected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Disclaimer */}
        <div className="mt-12 rounded-2xl border-2 border-warning/30 bg-warning/10 p-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">Medical Disclaimer</h3>
              <p className="text-sm text-muted-foreground">
                This AI diagnostic tool is intended to assist healthcare professionals and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified radiologist or physician for accurate interpretation of medical imaging and clinical decisions. The results provided by this tool are predictions and should be verified by licensed medical professionals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
