package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

var (
	firebaseAuth    *auth.Client
	firestoreClient *firestore.Client
)

// Data Structures
type WeekItem struct {
	Day        int         `firestore:"day" json:"day"`
	ExtraCount int         `firestore:"extraCount" json:"extraCount"`
	ID         interface{} `firestore:"id" json:"id"` // String və ya Number ola bilər
	Images     []string    `firestore:"images" json:"images"`
	Subtitle   string      `firestore:"subtitle" json:"subtitle"`
	Title      string      `firestore:"title" json:"title"`
	Type       string      `firestore:"type" json:"type"`
}

type ProgramWeeksDoc struct {
	CreatedAt interface{}           `firestore:"createdAt" json:"createdAt"`
	UserID    string                `firestore:"userId" json:"userId"`
	Weeks     map[string][]WeekItem `firestore:"weeks" json:"weeks"`
	Name      string                `json:"name"` // user_programs kolleksiyasından gələn ad
}

type MuscleGroup struct {
	Name     string `firestore:"name" json:"name"`
	ImageURL string `firestore:"imageUrl" json:"imageUrl"`
}

type Movement struct {
	Category     string        `firestore:"category" json:"category"`
	ExerciseID   string        `firestore:"exerciseId" json:"exerciseId"`
	Name         string        `firestore:"name" json:"name"`
	Reps         interface{}   `firestore:"reps" json:"reps"`
	SetsCount    interface{}   `firestore:"setsCount" json:"setsCount"`
	VideoURL     string        `firestore:"videoUrl" json:"videoUrl"`
	MuscleGroups []MuscleGroup `firestore:"muscleGroups" json:"muscleGroups"`
	MainImage    string        `firestore:"mainImage" json:"mainImage"`
	ImageURL     string        `firestore:"imageUrl" json:"imageUrl"`
	Instructions string        `firestore:"instructions" json:"instructions"`
}

type WorkoutSet struct {
	Label     string     `firestore:"label" json:"label"`
	Movements []Movement `firestore:"movements" json:"movements"`
	Rest      string     `firestore:"rest" json:"rest"`
}

type ExerciseBlock struct {
	Sets []WorkoutSet `firestore:"sets" json:"sets"`
}

type WorkoutPlanResponse struct {
	Name      string          `json:"name"`
	Exercises []ExerciseBlock `json:"exercises"`
}

// authMiddleware gələn sorğulardakı Firebase ID Token-i yoxlayır
func authMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// CORS Headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// "Authorization: Bearer <token>" başlığını (header) alırıq
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Authorization başlığı tapılmadı", http.StatusUnauthorized)
			return
		}

		// Token hissəsini ayırırıq
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || strings.ToLower(tokenParts[0]) != "bearer" {
			http.Error(w, "Yanlış Authorization formatı. 'Bearer <token>' olmalıdır", http.StatusUnauthorized)
			return
		}
		idToken := tokenParts[1]

		// Token-i Firebase ilə doğrulayırıq
		token, err := firebaseAuth.VerifyIDToken(context.Background(), idToken)
		if err != nil {
			http.Error(w, fmt.Sprintf("Token etibarsızdır: %v", err), http.StatusUnauthorized)
			return
		}

		// Token-i context-ə əlavə edirik ki, handler-lər istifadə edə bilsin
		ctx := context.WithValue(r.Context(), "userToken", token)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

// Firestore-dan sənədi retry ilə oxuyan helper funksiya
func getDocumentWithRetry(ctx context.Context, docRef *firestore.DocumentRef) (*firestore.DocumentSnapshot, error) {
	var err error
	var doc *firestore.DocumentSnapshot

	for i := 0; i < 3; i++ {
		doc, err = docRef.Get(ctx)
		if err == nil {
			return doc, nil
		}
		
		errMsg := err.Error()
		if strings.Contains(errMsg, "Unavailable") || strings.Contains(errMsg, "forcibly closed") || strings.Contains(errMsg, "transport is closing") {
			log.Printf("Retrying Firestore Get due to error: %v (Attempt %d/3)", err, i+1)
			time.Sleep(500 * time.Millisecond)
			continue
		}
		
		// Digər xətalar (məsələn NotFound) dərhal qaytarılır
		return nil, err
	}
	return nil, err
}

// getProgramWeeksHandler proqramın həftəlik məlumatlarını qaytarır
func getProgramWeeksHandler(w http.ResponseWriter, r *http.Request) {
	// Query parametrlərindən programId-ni alırıq
	programId := r.URL.Query().Get("programId")
	if programId == "" {
		http.Error(w, "programId parametri tələb olunur", http.StatusBadRequest)
		return
	}

	// Context-dən user tokenini alırıq (authMiddleware-dən gəlir)
	token := r.Context().Value("userToken").(*auth.Token)
	uid := token.UID

	ctx := context.Background()

	// Firestore-dan sənədi oxuyuruq
	log.Printf("Firestore request for doc: %s", programId)
	
	// RETRY İLƏ ÇAĞIRIŞ
	doc, err := getDocumentWithRetry(ctx, firestoreClient.Collection("user_program_weeks").Doc(programId))
	
	if err != nil {
		log.Printf("Firestore Get error: %v", err)
		// Sənəd tapılmadıqda 404 qaytar
		if strings.Contains(err.Error(), "NotFound") {
			http.Error(w, "Proqram tapılmadı", http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf("Firestore xətası: %v", err), http.StatusInternalServerError)
		return
	}

	var data ProgramWeeksDoc
	if err := doc.DataTo(&data); err != nil {
		log.Printf("DataTo error: %v", err)
		// Fallback: Try to load into map to see what fields are problematic
		var rawData map[string]interface{}
		if err2 := doc.DataTo(&rawData); err2 == nil {
			log.Printf("Raw data loaded successfully (for debug): %+v", rawData)
			
			// Xüsusilə 'weeks' sahəsini yoxlayaq
			if weeksVal, ok := rawData["weeks"]; ok {
				log.Printf("'weeks' sahəsinin tipi: %T", weeksVal)
				log.Printf("'weeks' sahəsinin dəyəri: %+v", weeksVal)
			} else {
				log.Printf("'weeks' sahəsi tapılmadı!")
			}
		}
		http.Error(w, fmt.Sprintf("Data parse xətası: %v", err), http.StatusInternalServerError)
		return
	}

	// Təhlükəsizlik yoxlaması: Bu proqram həqiqətən bu istifadəçiyə aiddir?
	if data.UserID != uid {
		http.Error(w, "Bu məlumatı görmək üçün icazəniz yoxdur", http.StatusForbidden)
		return
	}

	// Proqramın əlavə məlumatlarını (məs: name) user_programs-dan çəkirik
	progDoc, err := firestoreClient.Collection("user_programs").Doc(programId).Get(ctx)
	if err == nil {
		if progData := progDoc.Data(); progData != nil {
			if name, ok := progData["name"].(string); ok {
				data.Name = name
			}
		}
	} else {
		log.Printf("Program info fetch error (skipping name): %v", err)
	}

	// ----------------------------------------------------------------------
	for weekKey, weekItems := range data.Weeks {
		for i, item := range weekItems {
			if len(item.Images) > 0 {
				var cleanImages []string
				for _, img := range item.Images {
					// Backtick (`), tek tırnak ('), çift tırnak (") ve boşlukları temizle
					cleanImg := strings.Trim(img, " `\"'")
					if cleanImg != "" {
						cleanImages = append(cleanImages, cleanImg)
					}
				}
				// Temizlenmiş listeyi geri ata
				data.Weeks[weekKey][i].Images = cleanImages
			}
		}
	}
	// ----------------------------------------------------------------------

	// JSON olaraq qaytarırıq
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(data); err != nil {
		http.Error(w, fmt.Sprintf("JSON encode xətası: %v", err), http.StatusInternalServerError)
	}
}

func cleanString(s string) string {
	return strings.Trim(s, " `\"'\n\r\t")
}

// getWorkoutPlanHandler məşq planını və detallarını qaytarır
func getWorkoutPlanHandler(w http.ResponseWriter, r *http.Request) {
	workoutId := r.URL.Query().Get("workoutId")
	log.Printf("getWorkoutPlanHandler CALLED with workoutId: %s", workoutId)

	if workoutId == "" {
		http.Error(w, "workoutId parametri tələb olunur", http.StatusBadRequest)
		log.Println("Error: workoutId is empty")
		return
	}

	ctx := context.Background()
	log.Printf("Fetching workout plan for ID: %s", workoutId)

	// 1. Məşq planını 'workout_programs' və ya fallback olaraq 'workouts' kolleksiyasından tapırıq
	var planDoc *firestore.DocumentSnapshot
	var err error

	log.Println("Checking 'workout_programs' collection...")
	planDoc, err = getDocumentWithRetry(ctx, firestoreClient.Collection("workout_programs").Doc(workoutId))
	
	if err != nil || !planDoc.Exists() {
		log.Printf("Not found in 'workout_programs' (err: %v). Checking 'customUserWorkouts'...", err)
		// Fallback 1: 'customUserWorkouts' kolleksiyasını yoxla (User-in yaratdığı məşqlər)
		planDoc, err = getDocumentWithRetry(ctx, firestoreClient.Collection("customUserWorkouts").Doc(workoutId))
	}

	if err != nil || !planDoc.Exists() {
		log.Printf("Not found in 'customUserWorkouts' (err: %v). Checking 'workouts'...", err)
		// Fallback 2: 'workouts' kolleksiyasını yoxla
		planDoc, err = getDocumentWithRetry(ctx, firestoreClient.Collection("workouts").Doc(workoutId))
	}

	if err != nil || !planDoc.Exists() {
		log.Printf("Workout plan not found in either collection for ID: %s", workoutId)
		http.Error(w, "Workout plan not found", http.StatusNotFound)
		return
	}

	planData := planDoc.Data()
	log.Printf("Plan data found. Raw data keys: %v", getKeys(planData))

	workoutName, _ := planData["name"].(string)
	if workoutName == "" {
		workoutName, _ = planData["title"].(string)
	}
	if workoutName == "" {
		workoutName = "Workout"
	}
	log.Printf("Workout Name: %s", workoutName)

	// 2. Hərəkətlərin siyahısını alırıq (NEW STRUCTURE)
	// Structure is: exercises (array) -> sets (array) -> movements (array)
	rawExercises, ok := planData["exercises"].([]interface{})
	if !ok {
		log.Println("Warning: 'exercises' field is missing or not an array")
		rawExercises = []interface{}{}
	}
	log.Printf("Found %d exercise blocks in plan", len(rawExercises))

	var detailedBlocks []ExerciseBlock

	// Iterate over Blocks
	for i, rawBlock := range rawExercises {
		blockMap, ok := rawBlock.(map[string]interface{})
		if !ok {
			log.Printf("Block #%d is not a map, skipping", i)
			continue
		}
		
		rawSets, ok := blockMap["sets"].([]interface{})
		if !ok {
			log.Printf("Block #%d has no valid sets, skipping", i)
			continue
		}

		var detailedSets []WorkoutSet

		// Iterate over Sets
		for _, rawSet := range rawSets {
			setMap, ok := rawSet.(map[string]interface{})
			if !ok {
				continue
			}
			
			label, _ := setMap["label"].(string)
			rest, _ := setMap["rest"].(string) // or int to string conversion if needed
			
			rawMovements, ok := setMap["movements"].([]interface{})
			if !ok {
				continue
			}

			var detailedMovements []Movement

			// Iterate over Movements
			for _, rawMov := range rawMovements {
				movMap, ok := rawMov.(map[string]interface{})
				if !ok {
					continue
				}

				exName, _ := movMap["name"].(string)
				exId, _ := movMap["exerciseId"].(string)
				category, _ := movMap["category"].(string)
				reps := movMap["reps"]
				setsCount := movMap["setsCount"]

				log.Printf("Processing movement: %s (ID: %s)", exName, exId)

				// Fetch details from 'workouts' collection
				// Try by ID first if available
				var detail Movement // Reuse Movement struct for temp storage of details
				var docSnaps []*firestore.DocumentSnapshot

				if exId != "" {
					docSnap, err := firestoreClient.Collection("workouts").Doc(exId).Get(ctx)
					if err == nil && docSnap.Exists() {
						docSnaps = []*firestore.DocumentSnapshot{docSnap}
					}
				}

				// Fallback to name search if ID failed
				if len(docSnaps) == 0 && exName != "" {
					iter := firestoreClient.Collection("workouts").Where("name", "==", exName).Limit(1).Documents(ctx)
					docSnaps, _ = iter.GetAll()
				}

				if len(docSnaps) > 0 {
					// Map fields manually or use DataTo with a compatible struct
					// Using a temp struct or map to avoid overwriting existing Movement struct if types differ slightly
					// But let's assume 'workouts' doc matches closely enough or we map manually
					data := docSnaps[0].Data()
					
					// Extract details
					if val, ok := data["videoUrl"].(string); ok { detail.VideoURL = cleanString(val) }
					if val, ok := data["mainImage"].(string); ok { detail.MainImage = cleanString(val) }
					if val, ok := data["imageUrl"].(string); ok { detail.ImageURL = cleanString(val) }
					if val, ok := data["instructions"].(string); ok { detail.Instructions = val }
					
					// Muscle Groups
					if mgRaw, ok := data["muscleGroups"].([]interface{}); ok {
						for _, mgItem := range mgRaw {
							if mgMap, ok := mgItem.(map[string]interface{}); ok {
								name, _ := mgMap["name"].(string)
								img, _ := mgMap["imageUrl"].(string)
								detail.MuscleGroups = append(detail.MuscleGroups, MuscleGroup{Name: name, ImageURL: cleanString(img)})
							}
						}
					}
				}

				// Construct final movement
				finalMov := Movement{
					Category:     category,
					ExerciseID:   exId,
					Name:         exName,
					Reps:         reps,
					SetsCount:    setsCount,
					VideoURL:     detail.VideoURL,
					MuscleGroups: detail.MuscleGroups,
					MainImage:    detail.MainImage,
					ImageURL:     detail.ImageURL,
					Instructions: detail.Instructions,
				}
				
				// Fallback for image if not in detailed fetch but in plan (custom uploaded)
				if planImg, ok := movMap["image"].(string); ok && planImg != "" {
					finalMov.ImageURL = planImg
					finalMov.MainImage = planImg
				}

				detailedMovements = append(detailedMovements, finalMov)
			}
			
			detailedSets = append(detailedSets, WorkoutSet{
				Label:     label,
				Rest:      rest,
				Movements: detailedMovements,
			})
		}
		
		detailedBlocks = append(detailedBlocks, ExerciseBlock{Sets: detailedSets})
	}

	response := WorkoutPlanResponse{
		Name:      workoutName,
		Exercises: detailedBlocks,
	}

	log.Printf("Sending response with %d exercise blocks", len(detailedBlocks))
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("JSON encode error: %v", err)
		http.Error(w, fmt.Sprintf("JSON encode xətası: %v", err), http.StatusInternalServerError)
	}
}

func getKeys(m map[string]interface{}) []string {
    keys := make([]string, 0, len(m))
    for k := range m {
        keys = append(keys, k)
    }
    return keys
}

// secureDataHandler yalnız doğrulanan istifadəçilərə məlumat qaytarır
func secureDataHandler(w http.ResponseWriter, r *http.Request) {
	// Bura yalnız token-i düzgün olanlar girə bilər!
	// Gələcəkdə burada Firestore-dan məlumat çəkəcəyik
	fmt.Fprintf(w, "Təbrik edirik! Siz Firebase ilə təsdiqlənmiş istifadəçisiniz. Budur sizin gizli məlumatlarınız.")
}

// createCustomWorkoutHandler handles creating a new custom workout
func createCustomWorkoutHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
		return
	}

	token := r.Context().Value("userToken").(*auth.Token)
	uid := token.UID

	var payload struct {
		Name          string        `json:"name"`
		Level         string        `json:"level"`
		TargetMuscles []string      `json:"targetMuscles"`
		Equipment     []string      `json:"equipment"`
		Duration      string        `json:"duration"`
		CoverImage    string        `json:"coverImage"`
		Exercises     []interface{} `json:"exercises"` // We'll store this as raw JSON/Map in Firestore
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, fmt.Sprintf("Invalid request body: %v", err), http.StatusBadRequest)
		return
	}

	if payload.Name == "" {
		http.Error(w, "Program name is required", http.StatusBadRequest)
		return
	}

	// Prepare data for Firestore
	workoutData := map[string]interface{}{
		"userId":            uid,
		"name":              payload.Name,
		"level":             payload.Level,
		"targetMuscles":     payload.TargetMuscles,
		"equipment":         payload.Equipment,
		"duration":          payload.Duration,
		"coverImage":        payload.CoverImage,
		"exercises":         payload.Exercises,
		"workoutTarget":     "Custom",
		"workout_type_name": "Custom",
		"createdAt":         time.Now().Format(time.RFC3339),
		"isCustom":          true,
	}

	ctx := context.Background()
	docRef, _, err := firestoreClient.Collection("customUserWorkouts").Add(ctx, workoutData)
	if err != nil {
		log.Printf("Error creating custom workout: %v", err)
		http.Error(w, "Failed to save workout", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Workout created successfully",
		"id":      docRef.ID,
	})
}

func main() {
	// 1. Firebase üçün context yaradırıq
	ctx := context.Background()

	// 2. Service Account faylımızı göstəririk
	opt := option.WithCredentialsFile("serviceAccountKey.json")

	// 3. Firebase Tətbiqini inisializasiya edirik
	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		log.Fatalf("Firebase inisializasiya xətası: %v\n", err)
	}

	// 4. Firebase Auth klientini yaradırıq (Token yoxlamaq üçün)
	firebaseAuth, err = app.Auth(ctx)
	if err != nil {
		log.Fatalf("Firebase Auth xətası: %v\n", err)
	}

	// 5. Firestore klientini yaradırıq (Məlumat bazası üçün)
	firestoreClient, err = app.Firestore(ctx)
	if err != nil {
		log.Fatalf("Firestore xətası: %v\n", err)
	}
	defer firestoreClient.Close()

	fmt.Println("Firebase (Auth və Firestore) uğurla qoşuldu!")

	// Rotalar (Routes)
	// Açıq rota (Token tələb etmir)
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "GreenFit Go Backend işləyir! (Açıq səhifə)")
	})

	// Qorunan rota (Token TƏLƏB edir)
	http.HandleFunc("/api/data", authMiddleware(secureDataHandler))

	// YENİ: Proqram həftələrini gətirən rota
	http.HandleFunc("/api/program-weeks", authMiddleware(getProgramWeeksHandler))

	// YENİ: Məşq planını və detallarını gətirən rota
	http.HandleFunc("/api/workout-plan", authMiddleware(getWorkoutPlanHandler))

	// NEW: Create Custom Workout
	http.HandleFunc("/api/create-custom-workout", authMiddleware(createCustomWorkoutHandler))

	fmt.Println("Server http://localhost:8080 ünvanında dinləyir...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
