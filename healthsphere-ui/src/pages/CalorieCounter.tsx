import { useState, useRef, useEffect } from "react";
import { 
  Upload, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Camera,
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
  UtensilsCrossed,
  ClipboardList,
  Info,
  Sparkles,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { analyzeMealImage, CalorieCounterResponse } from "@/services/api";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function CalorieCounter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalorieCounterResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [displayedText, setDisplayedText] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fullText = "Snap a photo of your meal and let our advanced AI instantly identify every ingredient, calculate precise calories, proteins, carbs, and fats for smarter nutrition tracking.";

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError("");
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await analyzeMealImage(selectedFile);
      
      if (response.error) {
        setError(response.error);
        setResult(null);
      } else {
        setResult(response);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to analyze image";
      setError(errorMessage);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setResult(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center justify-center gap-3 mb-6 px-4 py-2 bg-gradient-to-r from-teal-100 to-emerald-100 rounded-full border border-teal-200">
            <div className="p-1.5 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full">
              <Camera className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">AI-Powered Nutrition Analysis</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600">
            Calorie & Macro Calculator
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed h-20 flex items-center">
            {displayedText}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div>
            <Card className="h-full border-0 shadow-lg bg-white rounded-2xl overflow-hidden">
              <CardHeader className="border-b-2 border-teal-200 bg-gradient-to-r from-teal-100 via-emerald-100 to-cyan-100 py-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-teal-700">Upload Your Meal</CardTitle>
                    <CardDescription className="font-semibold text-teal-600">Take or upload a clear photo for AI analysis</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* File Input Area OR Image Preview */}
                {!previewUrl ? (
                  // Upload Area (shown when no image selected)
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative border-2 border-dashed border-teal-300 rounded-2xl p-12 text-center cursor-pointer hover:border-emerald-500 hover:bg-gradient-to-br hover:from-teal-50 hover:to-emerald-50 group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full mb-4 group-hover:scale-125 transition-transform">
                        <Upload className="h-8 w-8 text-teal-600" />
                      </div>
                      <p className="text-base font-bold text-foreground mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>
                ) : (
                  // Image Preview (shown when image is selected)
                  <div className="relative space-y-3 bg-gradient-to-br from-teal-50 to-emerald-50 p-5 rounded-2xl border-2 border-teal-200">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-base font-bold text-foreground flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg">
                          <Camera className="h-4 w-4 text-white" />
                        </div>
                        Image Preview
                      </p>
                      {selectedFile && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground bg-white/80 px-3 py-1.5 rounded-full font-medium border border-teal-100">
                            {selectedFile.name}
                          </span>
                          <button
                            onClick={handleClear}
                            className="p-1.5 hover:bg-red-100 rounded-lg transition-all group"
                            title="Remove image"
                          >
                            <X className="h-5 w-5 text-red-500 group-hover:scale-125 transition-transform" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center max-h-96 overflow-auto rounded-2xl border-2 border-teal-200 bg-white shadow-lg">
                      <img
                        src={previewUrl}
                        alt="Meal preview"
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleAnalyze}
                    disabled={!selectedFile || loading}
                    className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl font-semibold rounded-xl"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Calculate Nutrition
                      </>
                    )}
                  </Button>
                  {selectedFile && !loading && (
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      size="lg"
                      className="px-6 border-2 border-red-300 hover:bg-red-50 rounded-xl"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive" className="border-2 border-red-400 bg-gradient-to-r from-red-50 to-orange-50 shadow-md rounded-xl">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <AlertDescription className="text-red-700 font-medium">{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6 h-full">
            {loading ? (
              <Card className="flex items-center justify-center h-full border-0 shadow-lg bg-gradient-to-br from-teal-50/50 to-emerald-50/50 rounded-2xl overflow-hidden">
                <CardContent className="text-center py-16">
                  <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 mb-6">
                    <LoadingSpinner />
                  </div>
                  <p className="text-muted-foreground text-center max-w-xs text-lg font-medium">
                    Our AI is analyzing your meal and fetching nutritional data...
                  </p>
                </CardContent>
              </Card>
            ) : result && !result.error ? (
              <>
                {/* Success Alert */}
                <Alert className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 shadow-lg rounded-2xl">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  <AlertDescription className="text-emerald-700 font-bold text-base">
                    ✓ Analysis Complete! Your nutrition breakdown is ready.
                  </AlertDescription>
                </Alert>

                {/* Nutritional Breakdown Card */}
                <Card className="border-0 shadow-lg bg-white rounded-2xl overflow-hidden">
                  <CardHeader className="border-b-2 border-teal-200 bg-gradient-to-r from-teal-100 via-emerald-100 to-cyan-100 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl">
                        <Flame className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-teal-700">Nutritional Breakdown</CardTitle>
                        <CardDescription className="font-semibold text-teal-600">Complete macro & calorie details</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-8">
                    <div className="grid grid-cols-2 gap-5">
                      {/* Calories */}
                      <div className="rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 p-6 border-2 border-red-200">
                        <div className="relative">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg">
                              <Flame className="h-4 w-4 text-white" />
                            </div>
                            <p className="text-xs font-bold text-muted-foreground">Calories</p>
                          </div>
                          <p className="text-4xl font-black text-red-600">
                            {result.total_calories}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2 font-semibold">kcal</p>
                        </div>
                      </div>

                      {/* Protein */}
                      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6 border-2 border-blue-200">
                        <div className="relative">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                              <Dumbbell className="h-4 w-4 text-white" />
                            </div>
                            <p className="text-xs font-bold text-muted-foreground">Protein</p>
                          </div>
                          <p className="text-4xl font-black text-blue-600">
                            {result.total_protein}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2 font-semibold">grams</p>
                        </div>
                      </div>

                      {/* Carbs */}
                      <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 p-6 border-2 border-amber-200">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg">
                              <Wheat className="h-4 w-4 text-white" />
                            </div>
                            <p className="text-xs font-bold text-muted-foreground">Carbs</p>
                          </div>
                          <p className="text-4xl font-black text-amber-600">
                            {result.total_carbs}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2 font-semibold">grams</p>
                        </div>
                      </div>

                      {/* Fat */}
                      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-6 border-2 border-emerald-200">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                              <Droplets className="h-4 w-4 text-white" />
                            </div>
                            <p className="text-xs font-bold text-muted-foreground">Fat</p>
                          </div>
                          <p className="text-4xl font-black text-emerald-600">
                            {result.total_fat}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2 font-semibold">grams</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detected Items */}
                <Card className="border-0 shadow-lg bg-white rounded-2xl overflow-hidden">
                  <CardHeader className="border-b-2 border-teal-200 bg-gradient-to-r from-teal-100 via-emerald-100 to-cyan-100 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl">
                        <UtensilsCrossed className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-teal-700">Detected Foods</CardTitle>
                        <CardDescription className="font-semibold text-teal-600">Identified meal components & portions</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {result.detected_foods.map((food, index) => (
                        <div
                          key={index}
                          className={`group p-5 rounded-2xl border-l-4 ${
                            food.portion_guessed
                              ? "border-l-amber-500 bg-gradient-to-r from-amber-50/80 to-transparent border-2 border-amber-200"
                              : "border-l-emerald-500 bg-gradient-to-r from-emerald-50/80 to-transparent border-2 border-emerald-200"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-bold text-foreground capitalize text-lg">
                                {food.item_name}
                              </p>
                              <p className="text-sm font-semibold text-teal-700 bg-white/60 inline-block px-3 py-1.5 rounded-lg mt-2 border border-teal-200">
                                {food.estimated_portion}
                              </p>
                            </div>
                            {food.portion_guessed && (
                              <Badge className="ml-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-md font-semibold">
                                Estimated
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {food.visual_reasoning}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="flex items-center justify-center h-full border-0 shadow-lg bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl overflow-hidden">
                <CardContent className="text-center py-16">
                  <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 mb-6 shadow-md">
                    <ClipboardList className="h-10 w-10 text-teal-600" />
                  </div>
                  <p className="text-muted-foreground max-w-xs text-lg font-medium">
                    Upload and analyze a meal to see the detailed nutritional breakdown
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Info Section */}
        <Card className="mt-16 border-0 shadow-lg bg-white rounded-2xl overflow-hidden">
          <CardHeader className="border-b-2 border-teal-200 bg-gradient-to-r from-teal-100 via-emerald-100 to-cyan-100 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl">
                <Info className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-teal-700">How It Works?</CardTitle>
                <CardDescription className="font-semibold text-teal-600 mt-1">4 simple steps to get your nutrition analysis</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-bold text-lg">
                    1
                  </div>
                </div>
                <div>
                  <p className="font-bold text-foreground text-lg">Upload Clear Photo</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">Take or upload a clear photo of your meal from above</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-bold text-lg">
                    2
                  </div>
                </div>
                <div>
                  <p className="font-bold text-foreground text-lg">AI Analysis</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">Our Llama 4 Vision AI identifies all food items and portions</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-bold text-lg">
                    3
                  </div>
                </div>
                <div>
                  <p className="font-bold text-foreground text-lg">Nutrition Data</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">Edamam API calculates precise nutritional values</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-bold text-lg">
                    4
                  </div>
                </div>
                <div>
                  <p className="font-bold text-foreground text-lg">Instant Results</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">Get calorie and macro breakdown for better health tracking</p>
                </div>
              </div>
            </div>
            <div className="mt-8 p-5 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border-2 border-teal-200 shadow-md">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-bold text-foreground bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">💡 Pro Tip:</span> For best results, take photos from directly above with good lighting and ensure all food items are clearly visible in the frame.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
