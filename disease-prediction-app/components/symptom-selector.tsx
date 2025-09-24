"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import axios from "axios"

// Symptom categories based on your training data
const symptomCategories = {
  "General Symptoms": [
    "itching",
    "fatigue",
    "weight_gain",
    "weight_loss",
    "anxiety",
    "restlessness",
    "lethargy",
    "sweating",
    "dehydration",
    "malaise",
    "dizziness",
    "weakness_in_limbs",
    "bruising",
    "obesity",
    "excessive_hunger",
    "depression",
    "irritability",
    "altered_sensorium",
    "prognosis"
  ],
  "Skin & External": [
    "skin_rash",
    "nodal_skin_eruptions",
    "yellowish_skin",
    "red_spots_over_body",
    "dischromic _patches",
    "pus_filled_pimples",
    "blackheads",
    "scurring",
    "skin_peeling",
    "silver_like_dusting",
    "small_dents_in_nails",
    "inflammatory_nails",
    "blister",
    "red_sore_around_nose",
    "yellow_crust_ooze",
    "brittle_nails"
  ],
  Respiratory: [
    "continuous_sneezing",
    "cough",
    "breathlessness",
    "phlegm",
    "throat_irritation",
    "runny_nose",
    "congestion",
    "chest_pain",
    "mucoid_sputum",
    "rusty_sputum",
    "blood_in_sputum",
    "sinus_pressure"
  ],
  Digestive: [
    "stomach_pain",
    "acidity",
    "ulcers_on_tongue",
    "vomiting",
    "nausea",
    "loss_of_appetite",
    "constipation",
    "abdominal_pain",
    "diarrhoea",
    "indigestion",
    "belly_pain",
    "pain_during_bowel_movements",
    "pain_in_anal_region",
    "bloody_stool",
    "irritation_in_anus",
    "passage_of_gases",
    "internal_itching",
    "stomach_bleeding",
    "distention_of_abdomen"
  ],
  Neurological: [
    "headache",
    "pain_behind_the_eyes",
    "blurred_and_distorted_vision",
    "spinning_movements",
    "loss_of_balance",
    "unsteadiness",
    "weakness_of_one_body_side",
    "loss_of_smell",
    "slurred_speech",
    "stiff_neck",
    "lack_of_concentration",
    "visual_disturbances",
    "coma"
  ],
  Musculoskeletal: [
    "joint_pain",
    "muscle_wasting",
    "back_pain",
    "knee_pain",
    "hip_joint_pain",
    "muscle_weakness",
    "swelling_joints",
    "movement_stiffness",
    "muscle_pain",
    "neck_pain"
  ],
  Cardiovascular: [
    "fast_heart_rate",
    "chest_pain",
    "palpitations",
    "prominent_veins_on_calf",
    "painful_walking"
  ],
  Urinary: [
    "burning_micturition",
    "spotting_ urination",
    "dark_urine",
    "yellow_urine",
    "bladder_discomfort",
    "foul_smell_of urine",
    "continuous_feel_of_urine",
    "polyuria"
  ],
  "Fever & Temperature": [
    "shivering",
    "chills",
    "high_fever",
    "mild_fever",
    "cold_hands_and_feets"
  ],
  "Eyes & Vision": [
    "sunken_eyes",
    "yellowing_of_eyes",
    "redness_of_eyes",
    "watering_from_eyes",
    "puffy_face_and_eyes"
  ],
  Endocrine: [
    "irregular_sugar_level",
    "enlarged_thyroid",
    "mood_swings",
    "increased_appetite"
  ],
  Reproductive: ["abnormal_menstruation", "extra_marital_contacts"],
  "Circulatory & Fluid": [
    "acute_liver_failure",
    "fluid_overload",
    "swelling_of_stomach",
    "swelled_lymph_nodes",
    "swollen_legs",
    "swollen_blood_vessels",
    "swollen_extremeties"
  ],
  "Oral & Throat": [
    "patches_in_throat",
    "drying_and_tingling_lips"
  ],
  "Risk Factors": [
    "family_history",
    "receiving_blood_transfusion",
    "receiving_unsterile_injections",
    "history_of_alcohol_consumption"
  ],
  "Severe Symptoms": [
    "toxic_look_(typhos)",
    "cramps"
  ]
}

interface LanguageInfo {
  name: string
}

interface Languages {
  [code: string]: LanguageInfo
}

export function SymptomCategoryTranslator() {
  const [languages, setLanguages] = useState<Languages>({})
  const [targetLang, setTargetLang] = useState("")
  const [translatedCategories, setTranslatedCategories] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load supported languages on mount
  useEffect(() => {
    async function loadLanguages() {
      try {
        const resp = await axios.get("/languages")
        setLanguages(resp.data)
      } catch (err: any) {
        setError("Failed to load languages: " + (err.message || err))
      }
    }
    loadLanguages()
  }, [])

  // Translate all symptoms in all categories
  const handleTranslate = async () => {
    if (!targetLang) {
      setError("Please select a target language.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      // Flatten all symptoms for batch translation
      const allSymptoms = Object.values(symptomCategories).flat()
      const uniqueSymptoms = Array.from(new Set(allSymptoms))

      // Batch translate all symptoms
      const resp = await axios.post("/translate", {
        text: uniqueSymptoms.join("\n"),
        to: targetLang,
      })
      const translatedText = resp.data.translated || ""
      const translatedList = translatedText.split("\n")

      // Map original symptoms to translated
      const symptomMap: Record<string, string> = {}
      uniqueSymptoms.forEach((symptom, idx) => {
        symptomMap[symptom] = translatedList[idx] || symptom
      })

      // Build translated categories
      const translated = Object.fromEntries(
        Object.entries(symptomCategories).map(([cat, symptoms]) => [
          cat,
          symptoms.map((s) => symptomMap[s] || s),
        ])
      )
      setTranslatedCategories(translated)
    } catch (err: any) {
      setError("Translation error: " + (err.message || err))
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h2>Symptom Categories Translator</h2>
      <div>
        <label>
          Translate to:{" "}
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            disabled={loading}
          >
            <option value="">Select language</option>
            {Object.entries(languages).map(([code, info]) => (
              <option key={code} value={code}>
                {info.name} ({code})
              </option>
            ))}
          </select>
        </label>
        <button onClick={handleTranslate} disabled={loading || !targetLang}>
          {loading ? "Translating..." : "Translate"}
        </button>
      </div>
      {error && <div style={{ color: "red", margin: "8px 0" }}>{error}</div>}
      <div style={{ marginTop: 20 }}>
        {translatedCategories ? (
          Object.entries(translatedCategories).map(([cat, symptoms]) => (
            <div key={cat} style={{ marginBottom: 16 }}>
              <strong>{cat}</strong>
              <ul>
                {(symptoms as string[]).map((symptom, idx) => (
                  <li key={idx}>{symptom}</li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <div style={{ color: "#888" }}>No translation yet.</div>
        )}
      </div>
    </div>
  )
}

interface SymptomSelectorProps {
  selectedSymptoms: string[]
  onSymptomsChange: (symptoms: string[]) => void
}

export function SymptomSelector({ selectedSymptoms, onSymptomsChange }: SymptomSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const handleSymptomToggle = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      onSymptomsChange(selectedSymptoms.filter((s) => s !== symptom))
    } else {
      onSymptomsChange([...selectedSymptoms, symptom])
    }
  }

  const formatSymptomName = (symptom: string) => {
    return symptom
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .replace(/\s+/g, " ")
      .trim()
  }

  const filteredCategories = Object.entries(symptomCategories)
    .map(([category, symptoms]) => ({
      category,
      symptoms: symptoms.filter((symptom) =>
        formatSymptomName(symptom).toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter(({ symptoms }) => symptoms.length > 0)

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search symptoms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Selected symptoms summary */}
      {selectedSymptoms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Selected Symptoms ({selectedSymptoms.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedSymptoms.map((symptom) => (
                <Badge
                  key={symptom}
                  variant="default"
                  className="cursor-pointer hover:bg-red-100 hover:text-red-800"
                  onClick={() => handleSymptomToggle(symptom)}
                >
                  {formatSymptomName(symptom)} ×
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Symptom categories */}
      <div className="grid gap-4">
        {filteredCategories.map(({ category, symptoms }) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {symptoms.map((symptom) => (
                  <div key={symptom} className="flex items-center space-x-2">
                    <Checkbox
                      id={symptom}
                      checked={selectedSymptoms.includes(symptom)}
                      onCheckedChange={() => handleSymptomToggle(symptom)}
                    />
                    <label
                      htmlFor={symptom}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {formatSymptomName(symptom)}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && searchTerm && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No symptoms found matching "{searchTerm}"</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}