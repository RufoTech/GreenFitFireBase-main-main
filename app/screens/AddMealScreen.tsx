import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar, TextInput, ScrollView, Image, ActivityIndicator, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import firestore from '@react-native-firebase/firestore';

const PRIMARY = "#ccff00";
const BG_DARK = "#0d0f06";
const SURFACE_HIGH = "#1e2114";
const SURFACE_CONTAINER = "#181b0f";
const TEXT_MUTED = "#abac9c";
const SECONDARY = "#ece856";
const TERTIARY = "#edd13a";
const OUTLINE = "rgba(117, 119, 104, 0.1)";

interface MealItemProps {
    icon?: string;
    imageUrl?: string;
    name: string;
    detail: string;
    onAdd?: (item: any) => void;
    data: any; // Full food data
}

const MealItem = ({ icon, imageUrl, name, detail, onAdd, data }: MealItemProps) => {
  const [added, setAdded] = useState(false);

  const router = useRouter();

  const handleMealPress = (item: any) => {
    router.push({
      pathname: "/screens/MealDetailsScreen",
      params: { 
        name: item.name, 
        detail: item.detail, 
        icon: item.icon, 
        imageUrl: item.imageUrl,
        // Pass nutritional data
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        servingSize: data.servingSize,
        potassium: data.potassium,
        sodium: data.sodium,
        sugar: data.sugar,
        fiber: data.fiber,
        cholesterol: data.cholesterol,
        detailsImage: data.detailsImage
      }
    });
  };

  const handleAdd = () => {
    setAdded(true);
    onAdd?.({ name, detail, icon, imageUrl, ...data });
    // Visual feedback duration
    setTimeout(() => setAdded(false), 1000);
  };


  return (
    <TouchableOpacity 
        style={styles.oldMealItem}
        onPress={() => handleMealPress({ name, detail, icon, imageUrl })}
        activeOpacity={0.7}
    >
      <View style={styles.oldMealLeft}>
        <View style={styles.oldMealIconContainer}>
          {imageUrl ? (
             <Image source={{ uri: imageUrl }} style={styles.oldMealImage} resizeMode="cover" />
          ) : (
             <MaterialIcons name={icon as any || "restaurant"} size={24} color={PRIMARY} />
          )}
        </View>
        <View>
          <Text style={styles.oldMealName}>{name}</Text>
          <Text style={styles.oldMealDetail}>{detail}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={handleAdd}
        style={[
            styles.oldAddButton,
            added ? styles.oldAddButtonAdded : styles.oldAddButtonNormal
        ]}
        activeOpacity={0.8}
      >
        <MaterialIcons name={added ? "check" : "add"} size={24} color="#1f230f" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function AddMealScreen() {
  const [activeCategory, setActiveCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addedItems, setAddedItems] = useState<any[]>([]);
  const [isOldUiVisible, setIsOldUiVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const snapshot = await firestore().collection('foods').get();
        const foodList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(foodList.map((item: any) => item.category).filter(Boolean))) as string[];
        
        setCategories(uniqueCategories);
        setFoods(foodList);
        
        if (uniqueCategories.length > 0) {
            setActiveCategory(uniqueCategories[0]);
        }
      } catch (error) {
        console.error("Error fetching foods:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFoods();
  }, []);

  const getFilteredFoods = () => {
    let filtered = foods;
    
    // Filter by category
    if (activeCategory) {
        filtered = filtered.filter(f => f.category === activeCategory);
    }
    
    // Filter by search
    if (search) {
        filtered = filtered.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
    }
    
    return filtered;
  };

  const handleAdd = (item: any) => {
    setAddedItems((prev) => [...prev, item]);
  };


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BG_DARK} />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
            <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => router.back()}
            >
                <MaterialIcons name="arrow-back" size={24} color="#f1f5f9" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>September</Text>
              <Text style={styles.headerSubtitle}>WEEK 38</Text>
            </View>
            <View style={styles.placeholderButton} />
        </View>

        {/* Horizontal Calendar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarContainer}>
            {['Mon 14', 'Tue 15', 'Wed 16', 'Thu 17', 'Fri 18', 'Sat 19', 'Sun 20'].map((day, index) => {
                const [dayName, dayNum] = day.split(' ');
                const isActive = index === 2; // Wed 16 is active in the design
                return (
                    <TouchableOpacity key={day} style={[styles.dayCard, isActive && styles.dayCardActive]}>
                        <Text style={[styles.dayName, isActive && styles.dayTextActive]}>{dayName}</Text>
                        <Text style={[styles.dayNumber, isActive && styles.dayTextActive]}>{dayNum}</Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Daily Nutrition Summary */}
        <View style={styles.nutritionCard}>
          <View style={styles.nutritionGlow} />
          
          <View style={styles.nutritionHeader}>
            <View>
              <Text style={styles.nutritionLabel}>DAILY ENERGY</Text>
              <View style={styles.caloriesRow}>
                <Text style={styles.caloriesValue}>1,850</Text>
                <Text style={styles.caloriesTarget}>/ 2,400 kcal</Text>
              </View>
            </View>
            <View style={styles.targetBadge}>
              <Text style={styles.targetBadgeText}>77% TARGET</Text>
            </View>
          </View>

          {/* Main Progress Bar */}
          <View style={styles.mainProgressBarBg}>
            <View style={[styles.mainProgressBarFill, { width: '77%' }]} />
          </View>

          {/* Macro Breakdown */}
          <View style={styles.macrosContainer}>
            <View style={styles.macroCol}>
              <View style={styles.macroHeader}>
                <Text style={styles.macroLabel}>PROTEIN</Text>
                <Text style={styles.macroValue}>142g</Text>
              </View>
              <View style={styles.macroBarBg}>
                <View style={[styles.macroBarFill, { width: '85%', backgroundColor: SECONDARY }]} />
              </View>
            </View>

            <View style={styles.macroCol}>
              <View style={styles.macroHeader}>
                <Text style={styles.macroLabel}>CARBS</Text>
                <Text style={styles.macroValue}>190g</Text>
              </View>
              <View style={styles.macroBarBg}>
                <View style={[styles.macroBarFill, { width: '60%', backgroundColor: TERTIARY }]} />
              </View>
            </View>

            <View style={styles.macroCol}>
              <View style={styles.macroHeader}>
                <Text style={styles.macroLabel}>FATS</Text>
                <Text style={styles.macroValue}>58g</Text>
              </View>
              <View style={styles.macroBarBg}>
                <View style={[styles.macroBarFill, { width: '45%', backgroundColor: TEXT_MUTED }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Meal List Sections */}
        <View style={styles.mealSections}>
          
          {/* Breakfast */}
          <View style={styles.mealSection}>
            <View style={styles.mealSectionHeader}>
              <View style={styles.mealSectionTitleRow}>
                <View style={styles.mealSectionIndicator} />
                <Text style={styles.mealSectionTitle}>BREAKFAST</Text>
              </View>
              <Text style={styles.mealSectionCalories}>480 KCAL</Text>
            </View>

            <View style={styles.mealSectionItems}>
              <View style={styles.newMealItem}>
                <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBivQBxEF8qR4pORVRyzVfkpD-Ajx1cEiHkgC1v1dkS0RXsOfdpMDaANGyUN1kIroRveauJvJfU9QXZRBoWL7m1_IF-lZN9BnFrpZnFHIzO9dTt4t1pBsyTJvE6CFqGh6kV8dilbl82u_0ExvDT9S48D9JSJXqyd2UERkclF_3AykevQPc_RZoe3MQVdo-cs74S7F2LSNcWcYXBmpBaiWfgeLUVJaL2Lpmta85a8HQgXu0kUO_FTs0PnbfvJttm2GpQRPkRFZsOYgM' }} style={styles.newMealImage} />
                <View style={styles.newMealInfo}>
                  <Text style={styles.newMealName} numberOfLines={1}>AVOCADO SOURDOUGH TOAST</Text>
                  <Text style={styles.newMealMacros}>P: 12G • C: 42G • F: 18G</Text>
                </View>
                <View style={styles.newMealCals}>
                  <Text style={styles.newMealCalsValue}>345</Text>
                  <Text style={styles.newMealCalsLabel}>KCAL</Text>
                </View>
              </View>

              <View style={styles.newMealItem}>
                <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzt5Dxr96BEs2-OM07OiwQl09_tf-Rofdq7QC5sGDKyn_5d01QRt1LP0G-ptSdTg1Y2LTsU8bQCNzmuHAhLnLJ9jF_ak0uP1f9nR5jIId3sfGsf6Accp-r9Wb4wSfbqi2NvO0gT6vAlrfy6Wzp3_BgefrA0JPba85cvQAei-sW6vxODpMbHTOKSuPE5BVjdy9oFvXInR0ddp-yNRRMgx38AK4fGKPQ0aqhfsncWzFi4iD2R8BVS6vL93RieSsNkVKNKoi8FrbeMM8' }} style={styles.newMealImage} />
                <View style={styles.newMealInfo}>
                  <Text style={styles.newMealName} numberOfLines={1}>OAT MILK LATTE</Text>
                  <Text style={styles.newMealMacros}>P: 4G • C: 12G • F: 5G</Text>
                </View>
                <View style={styles.newMealCals}>
                  <Text style={styles.newMealCalsValue}>135</Text>
                  <Text style={styles.newMealCalsLabel}>KCAL</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Lunch */}
          <View style={styles.mealSection}>
            <View style={styles.mealSectionHeader}>
              <View style={styles.mealSectionTitleRow}>
                <View style={styles.mealSectionIndicator} />
                <Text style={styles.mealSectionTitle}>LUNCH</Text>
              </View>
              <Text style={styles.mealSectionCalories}>720 KCAL</Text>
            </View>

            <View style={styles.mealSectionItems}>
              <View style={[styles.newMealItem, { borderLeftWidth: 4, borderLeftColor: 'rgba(204,255,0,0.4)' }]}>
                <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtEN5Htwbx6cHZhA34XRhx8pCjf0ZdCXoDDSFlixbxnFQVjxC93TPqcD2YgER8AgXQsgdj10rdipIsms7gBoE-QiT0ojZ7oqLJnWKXmSCCKL7iIphvtGQfPtKAQn2kfvQ9PhqVit1oeM5uVTWF0PmrHOqIkYTk1XZzw0H64PaIaBnAZgo4Lh_WEg_5FAiGYmUkyYwsQB7Eq5Pu6PkiISruUefR3v-3L5gmG7LZcM13_q3PskHZEKIFbMcHKDvx05grGGIvx4Sh70U' }} style={styles.newMealImage} />
                <View style={styles.newMealInfo}>
                  <Text style={styles.newMealName} numberOfLines={1}>QUINOA & GRILLED CHICKEN</Text>
                  <Text style={styles.newMealMacros}>P: 48G • C: 55G • F: 12G</Text>
                </View>
                <View style={styles.newMealCals}>
                  <Text style={styles.newMealCalsValue}>720</Text>
                  <Text style={styles.newMealCalsLabel}>KCAL</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Dinner */}
          <View style={styles.mealSection}>
            <View style={styles.mealSectionHeader}>
              <View style={styles.mealSectionTitleRow}>
                <View style={styles.mealSectionIndicator} />
                <Text style={styles.mealSectionTitle}>DINNER</Text>
              </View>
              <Text style={styles.mealSectionCalories}>650 KCAL</Text>
            </View>

            <View style={styles.mealSectionItems}>
              <View style={styles.newMealItem}>
                <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtcl-0pLlzMUQvB7Tzidz9Ml_TH6eAi9_qxzkv_t0wx3LQD08vf8Fsom9KAC5jmKT45LOokyJaa3PruKT6Ej5DqCoahFWbAlw6d1EHfaTe1Urd09vLZsdCVLvAyAZ7TiBOjzYcEpuLc_V4mWcTrJ0JuUkC90vC_1tS1cWpiFLgNzOFGeqP8lqJDFBYrnSmRBhD1TyWsZex_3r2i9ouhtuiR07TJnjSXM-2EgYMx1HrywXAECGV5EmGTyLV5h5v3t0PZK5Mpxrw1kE' }} style={styles.newMealImage} />
                <View style={styles.newMealInfo}>
                  <Text style={styles.newMealName} numberOfLines={1}>ROASTED SALMON & ASPARAGUS</Text>
                  <Text style={styles.newMealMacros}>P: 38G • C: 20G • F: 28G</Text>
                </View>
                <View style={styles.newMealCals}>
                  <Text style={styles.newMealCalsValue}>650</Text>
                  <Text style={styles.newMealCalsLabel}>KCAL</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Snacks (Empty State) */}
          <View style={styles.mealSection}>
            <View style={styles.mealSectionHeader}>
              <View style={styles.mealSectionTitleRow}>
                <View style={[styles.mealSectionIndicator, { backgroundColor: 'rgba(204,255,0,0.2)' }]} />
                <Text style={[styles.mealSectionTitle, { opacity: 0.4 }]}>SNACKS</Text>
              </View>
              <Text style={[styles.mealSectionCalories, { opacity: 0.4 }]}>0 KCAL</Text>
            </View>

            <View style={styles.emptySnacksContainer}>
              <Text style={styles.emptySnacksText}>NO SNACKS LOGGED YET</Text>
              <TouchableOpacity style={styles.addSnackButton}>
                <MaterialIcons name="add-circle" size={18} color={PRIMARY} />
                <Text style={styles.addSnackText}>ADD SNACK</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab}
        activeOpacity={0.9}
        onPress={() => setIsOldUiVisible(true)}
      >
        <MaterialIcons name="add" size={32} color="#1f230f" />
      </TouchableOpacity>

      {/* Old UI Modal */}
      <Modal visible={isOldUiVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={[styles.container, { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
            <View style={[styles.header, { paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }]}>
                <View style={styles.oldHeaderTop}>
                    <TouchableOpacity 
                        style={styles.oldIconButton}
                        onPress={() => setIsOldUiVisible(false)}
                    >
                        <MaterialIcons name="close" size={24} color="#f1f5f9" />
                    </TouchableOpacity>
                    <Text style={styles.oldHeaderTitle}>Add Meal</Text>
                    {addedItems.length > 0 ? (
                        <View style={styles.oldCounterBadge}>
                            <Text style={styles.oldCounterText}>{addedItems.length}</Text>
                        </View>
                    ) : (
                        <View style={styles.oldPlaceholderButton} />
                    )}
                </View>

                {/* Search Input */}
                <View style={styles.oldSearchContainer}>
                    <View style={styles.oldSearchBar}>
                        <MaterialIcons name="search" size={24} color="rgba(204,255,0,0.6)" style={{ marginRight: 8 }} />
                        <TextInput
                            style={styles.oldSearchInput}
                            placeholder="Search food"
                            placeholderTextColor="rgba(204,255,0,0.4)"
                            value={search}
                            onChangeText={setSearch}
                        />
                        <TouchableOpacity>
                            <MaterialIcons name="qr-code-scanner" size={24} color="rgba(204,255,0,0.6)" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Category Tabs */}
                <View style={{ height: 50 }}>
                    {loading ? (
                        <View style={{ paddingLeft: 16, justifyContent: 'center' }}>
                            <ActivityIndicator size="small" color={PRIMARY} />
                        </View>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.oldTabsContainer}>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    onPress={() => setActiveCategory(cat)}
                                    style={[
                                        styles.oldTabButton,
                                        activeCategory === cat ? styles.oldTabButtonActive : styles.oldTabButtonInactive
                                    ]}
                                >
                                    <Text style={[
                                        styles.oldTabText,
                                        activeCategory === cat ? styles.oldTabTextActive : styles.oldTabTextInactive
                                    ]}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>
            </View>

            {/* Content Section */}
            <ScrollView contentContainerStyle={styles.oldScrollContent}>
                {loading ? (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={PRIMARY} />
                        <Text style={{ color: 'rgba(255,255,255,0.5)', marginTop: 10 }}>Loading foods...</Text>
                    </View>
                ) : (
                    <View style={styles.oldMealsList}>
                        {getFilteredFoods().map((food: any) => (
                            <MealItem 
                                key={food.id} 
                                name={food.name || 'Unknown Food'}
                                detail={`${food.measureType || ''} • ${food.calories || 0} kcal`}
                                imageUrl={food.image}
                                onAdd={handleAdd} 
                                data={food}
                            />
                        ))}
                        {getFilteredFoods().length === 0 && (
                            <Text style={styles.oldEmptyText}>No foods found for this category</Text>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Fixed Footer Action */}
            <View style={styles.oldFooter}>
                <TouchableOpacity 
                    style={styles.oldCustomMealButton} 
                    activeOpacity={0.9}
                    onPress={() => {
                        setIsOldUiVisible(false);
                        router.push('/screens/AddCustomMealScreen');
                    }}
                >
                    <MaterialIcons name="add-circle" size={24} color="#1f230f" />
                    <Text style={styles.oldCustomMealText}>Add Custom Meal</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_DARK,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#fdfdec',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: TEXT_MUTED,
    letterSpacing: 2,
  },
  placeholderButton: {
    width: 40,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingBottom: 8,
  },
  calendarContainer: {
    paddingBottom: 8,
    gap: 16,
  },
  dayCard: {
    width: 56,
    height: 80,
    borderRadius: 12,
    backgroundColor: SURFACE_CONTAINER,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: OUTLINE,
    opacity: 0.6,
  },
  dayCardActive: {
    backgroundColor: PRIMARY,
    opacity: 1,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 0,
  },
  dayName: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#fdfdec',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fdfdec',
  },
  dayTextActive: {
    color: '#3a4a00',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120, // space for FAB
  },
  nutritionCard: {
    backgroundColor: SURFACE_HIGH,
    borderRadius: 12,
    padding: 24,
    marginBottom: 32,
    overflow: 'hidden',
  },
  nutritionGlow: {
    position: 'absolute',
    top: -96,
    right: -96,
    width: 192,
    height: 192,
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    borderRadius: 96,
  },
  nutritionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  nutritionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: TEXT_MUTED,
    letterSpacing: 1,
  },
  caloriesRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 4,
  },
  caloriesValue: {
    fontSize: 48,
    fontWeight: '900',
    color: PRIMARY,
    letterSpacing: -2,
  },
  caloriesTarget: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_MUTED,
  },
  targetBadge: {
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  targetBadgeText: {
    color: PRIMARY,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  mainProgressBarBg: {
    height: 16,
    backgroundColor: SURFACE_CONTAINER,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 24,
  },
  mainProgressBarFill: {
    height: '100%',
    backgroundColor: PRIMARY,
    borderRadius: 8,
  },
  macrosContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  macroCol: {
    flex: 1,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  macroLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: TEXT_MUTED,
    letterSpacing: 1,
  },
  macroValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fdfdec',
  },
  macroBarBg: {
    height: 4,
    backgroundColor: SURFACE_CONTAINER,
    borderRadius: 2,
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  mealSections: {
    gap: 32,
  },
  mealSection: {},
  mealSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  mealSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mealSectionIndicator: {
    width: 32,
    height: 2,
    backgroundColor: PRIMARY,
  },
  mealSectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fdfdec',
    letterSpacing: 1,
  },
  mealSectionCalories: {
    fontSize: 12,
    fontWeight: 'bold',
    color: TEXT_MUTED,
    letterSpacing: 1,
  },
  mealSectionItems: {
    gap: 12,
  },
  newMealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE_CONTAINER,
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  newMealImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  newMealInfo: {
    flex: 1,
  },
  newMealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fdfdec',
    marginBottom: 4,
  },
  newMealMacros: {
    fontSize: 12,
    fontWeight: '500',
    color: TEXT_MUTED,
    letterSpacing: 1,
  },
  newMealCals: {
    alignItems: 'flex-end',
  },
  newMealCalsValue: {
    fontSize: 20,
    fontWeight: '900',
    color: PRIMARY,
  },
  newMealCalsLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: TEXT_MUTED,
    letterSpacing: 1,
  },
  emptySnacksContainer: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: OUTLINE,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptySnacksText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: TEXT_MUTED,
    letterSpacing: 2,
  },
  addSnackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: SURFACE_HIGH,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addSnackText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#fdfdec',
    letterSpacing: 2,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
  },
  
  // --- Old UI Styles for Modal ---
  oldHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  oldIconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(204,255,0,0.1)',
  },
  oldHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f1f5f9',
    flex: 1,
    textAlign: 'center',
  },
  oldCounterBadge: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(204,255,0,0.2)',
  },
  oldCounterText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: 'bold',
  },
  oldPlaceholderButton: {
    width: 40,
    height: 40,
  },
  oldSearchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  oldSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(204,255,0,0.1)',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  oldSearchInput: {
    flex: 1,
    color: '#f1f5f9',
    fontSize: 16,
  },
  oldTabsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  oldTabButton: {
    height: 40,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oldTabButtonActive: {
    backgroundColor: PRIMARY,
  },
  oldTabButtonInactive: {
    backgroundColor: 'rgba(204,255,0,0.1)',
  },
  oldTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  oldTabTextActive: {
    color: '#1f230f',
  },
  oldTabTextInactive: {
    color: PRIMARY,
  },
  oldScrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  oldMealsList: {
    gap: 12,
  },
  oldMealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  oldMealLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  oldMealIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(204,255,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  oldMealImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  oldMealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  oldMealDetail: {
    fontSize: 14,
    color: 'rgba(204,255,0,0.6)',
    marginTop: 2,
  },
  oldAddButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oldAddButtonNormal: {
    backgroundColor: PRIMARY,
  },
  oldAddButtonAdded: {
    backgroundColor: '#4ade80', // green-400
    transform: [{ scale: 1.1 }],
  },
  oldEmptyText: {
    color: 'rgba(204,255,0,0.4)',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
  oldFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 32,
    backgroundColor: 'rgba(13,15,6,0.9)', 
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  oldCustomMealButton: {
    width: '100%',
    height: 56,
    backgroundColor: PRIMARY,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  oldCustomMealText: {
    color: '#1f230f',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
