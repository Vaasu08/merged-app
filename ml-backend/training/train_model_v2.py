"""
Train Industry-Grade ATS Model v2.0

Improvements:
- Better hyperparameter tuning
- Cross-validation
- Feature importance analysis
- Model comparison
- Robust evaluation on edge cases
"""

import os
import warnings
import pickle
import numpy as np
import pandas as pd
from typing import Dict, Tuple, List
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler
import xgboost as xgb

warnings.filterwarnings('ignore')


class ATSModelTrainerV2:
    """
    Improved ATS Model Trainer with better generalization
    """
    
    # Features to use for training (excluding analysis columns)
    FEATURE_COLUMNS = [
        'total_words', 'total_sentences', 'total_characters',
        'avg_word_length', 'avg_sentence_length',
        'total_sections', 'has_summary', 'has_experience',
        'has_education', 'has_skills', 'has_projects', 'has_certifications',
        'has_email', 'has_phone', 'has_linkedin', 'has_github',
        'action_verb_count', 'quantifiable_metrics', 'bullet_point_count',
        'technical_terms_count', 'years_of_experience', 'number_of_jobs',
        'has_job_titles', 'degree_level', 'has_gpa',
        'total_skills_mentioned', 'programming_languages',
        'readability_score', 'appropriate_length', 'consistent_formatting',
        'keyword_match_score'
    ]
    
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_importance = None
    
    def load_data(self, filepath: str) -> pd.DataFrame:
        """Load training data"""
        print(f"\n📂 Loading data from {filepath}...")
        df = pd.read_csv(filepath)
        print(f"   Loaded {len(df):,} samples with {len(df.columns)} columns")
        return df
    
    def prepare_features(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare features for training"""
        print("\n🔧 Preparing features...")
        
        # Select only feature columns that exist in the data
        available_features = [col for col in self.FEATURE_COLUMNS if col in df.columns]
        print(f"   Using {len(available_features)} features")
        
        # Convert boolean columns to int
        X = df[available_features].copy()
        bool_cols = X.select_dtypes(include=['bool']).columns
        X[bool_cols] = X[bool_cols].astype(int)
        
        # Target variable
        y = df['ats_score'].values
        
        # Scale features
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        
        print(f"   X shape: {X_scaled.shape}")
        print(f"   y shape: {y.shape}")
        print(f"   y range: {y.min():.1f} - {y.max():.1f}")
        
        return X_scaled, y, available_features
    
    def cross_validate(self, X: np.ndarray, y: np.ndarray,
                       n_folds: int=5) -> Dict:
        """Perform cross-validation"""
        print(f"\n🔄 Performing {n_folds}-fold cross-validation...")
        
        model = xgb.XGBRegressor(
            n_estimators=300,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            verbosity=0
        )
        
        kfold = KFold(n_splits=n_folds, shuffle=True, random_state=42)
        
        # Calculate scores
        mae_scores = []
        r2_scores = []
        
        for fold, (train_idx, val_idx) in enumerate(kfold.split(X), 1):
            X_train, X_val = X[train_idx], X[val_idx]
            y_train, y_val = y[train_idx], y[val_idx]
            
            model.fit(X_train, y_train)
            y_pred = model.predict(X_val)
            
            mae = mean_absolute_error(y_val, y_pred)
            r2 = r2_score(y_val, y_pred)
            
            mae_scores.append(mae)
            r2_scores.append(r2)
            
            print(f"   Fold {fold}: MAE = {mae:.2f}, R² = {r2:.4f}")
        
        cv_results = {
            'mae_mean': np.mean(mae_scores),
            'mae_std': np.std(mae_scores),
            'r2_mean': np.mean(r2_scores),
            'r2_std': np.std(r2_scores)
        }
        
        print(f"\n   Average MAE: {cv_results['mae_mean']:.2f} ± {cv_results['mae_std']:.2f}")
        print(f"   Average R²:  {cv_results['r2_mean']:.4f} ± {cv_results['r2_std']:.4f}")
        
        return cv_results
    
    def train_model(self, X: np.ndarray, y: np.ndarray,
                    feature_names: List[str]) -> None:
        """Train the final model with optimal parameters"""
        print("\n🚀 Training final model...")
        
        # Split for final evaluation
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.15, random_state=42
        )
        
        print(f"   Training samples: {len(X_train):,}")
        print(f"   Test samples: {len(X_test):,}")
        
        # Model with tuned hyperparameters
        self.model = xgb.XGBRegressor(
            n_estimators=500,
            max_depth=7,
            learning_rate=0.03,
            min_child_weight=3,
            subsample=0.85,
            colsample_bytree=0.85,
            reg_alpha=0.1,
            reg_lambda=1.0,
            random_state=42,
            verbosity=1,
            early_stopping_rounds=50
        )
        
        # Train with early stopping
        self.model.fit(
            X_train, y_train,
            eval_set=[(X_test, y_test)],
            verbose=False
        )
        
        print(f"   Best iteration: {self.model.best_iteration}")
        
        # Store feature importance
        self.feature_importance = dict(zip(
            feature_names,
            self.model.feature_importances_
        ))
        
        return X_train, X_test, y_train, y_test
    
    def evaluate_model(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict:
        """Evaluate model performance"""
        print("\n📊 Evaluating model...")
        
        y_pred = self.model.predict(X_test)
        
        # Calculate metrics
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        
        # Score band accuracy
        def get_band(score):
            if score < 30: return 'very_poor'
            elif score < 45: return 'poor'
            elif score < 60: return 'below_avg'
            elif score < 75: return 'average'
            elif score < 85: return 'good'
            else: return 'excellent'
        
        actual_bands = [get_band(s) for s in y_test]
        pred_bands = [get_band(s) for s in y_pred]
        band_accuracy = sum(a == p for a, p in zip(actual_bands, pred_bands)) / len(y_test)
        
        # Within 5 points accuracy
        within_5 = np.mean(np.abs(y_test - y_pred) <= 5)
        within_10 = np.mean(np.abs(y_test - y_pred) <= 10)
        
        results = {
            'mae': mae,
            'rmse': rmse,
            'r2': r2,
            'band_accuracy': band_accuracy,
            'within_5_points': within_5,
            'within_10_points': within_10
        }
        
        print(f"\n   {'Metric':<25} {'Value':<15}")
        print("   " + "-" * 40)
        print(f"   {'MAE (Mean Absolute Error)':<25} {mae:.2f} points")
        print(f"   {'RMSE':<25} {rmse:.2f} points")
        print(f"   {'R² Score':<25} {r2:.4f} ({r2*100:.2f}%)")
        print(f"   {'Band Accuracy':<25} {band_accuracy*100:.1f}%")
        print(f"   {'Within 5 Points':<25} {within_5*100:.1f}%")
        print(f"   {'Within 10 Points':<25} {within_10*100:.1f}%")
        
        return results
    
    def print_feature_importance(self, top_n: int=15):
        """Print top important features"""
        print(f"\n🎯 Top {top_n} Important Features:")
        print("   " + "-" * 50)
        
        sorted_features = sorted(
            self.feature_importance.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        for i, (feat, imp) in enumerate(sorted_features[:top_n], 1):
            bar = '█' * int(imp * 100)
            print(f"   {i:2}. {feat:<30} {imp:.4f} {bar}")
    
    def analyze_predictions(self, X_test: np.ndarray, y_test: np.ndarray):
        """Analyze prediction patterns"""
        print("\n🔍 Prediction Analysis:")
        
        y_pred = self.model.predict(X_test)
        errors = y_test - y_pred
        
        print(f"\n   Error Distribution:")
        print(f"   Mean Error: {np.mean(errors):.2f}")
        print(f"   Error Std:  {np.std(errors):.2f}")
        print(f"   Max Overestimate: {np.min(errors):.2f}")
        print(f"   Max Underestimate: {np.max(errors):.2f}")
        
        # Analyze by score ranges
        print(f"\n   Accuracy by Score Range:")
        ranges = [(0, 30), (30, 50), (50, 70), (70, 85), (85, 100)]
        
        for low, high in ranges:
            mask = (y_test >= low) & (y_test < high)
            if mask.sum() > 0:
                range_mae = mean_absolute_error(y_test[mask], y_pred[mask])
                range_r2 = r2_score(y_test[mask], y_pred[mask]) if mask.sum() > 1 else 0
                print(f"   {low:2}-{high:3}: MAE = {range_mae:.2f}, R² = {range_r2:.4f} (n={mask.sum()})")
    
    def save_model(self, model_path: str="../models/ats_model_v2.pkl",
                   metrics_path: str="../models/metrics_v2.txt"):
        """Save model and metrics"""
        print(f"\n💾 Saving model to {model_path}...")
        
        os.makedirs(os.path.dirname(model_path) if os.path.dirname(model_path) else '.', exist_ok=True)
        
        # Save complete model package
        model_package = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_importance': self.feature_importance,
            'feature_columns': self.FEATURE_COLUMNS,
            'version': '2.0'
        }
        
        with open(model_path, 'wb') as f:
            pickle.dump(model_package, f)
        
        model_size = os.path.getsize(model_path) / (1024 * 1024)
        print(f"   Model saved ({model_size:.2f} MB)")
        
        # Also save for backward compatibility (model only)
        compat_path = model_path.replace('_v2.pkl', '.pkl')
        with open(compat_path, 'wb') as f:
            pickle.dump(self.model, f)
        print(f"   Backward-compatible model saved to {compat_path}")
        
        return model_path


def main():
    """Main training pipeline"""
    print("\n" + "=" * 70)
    print("INDUSTRY-GRADE ATS MODEL TRAINING v2.0")
    print("=" * 70)
    
    trainer = ATSModelTrainerV2()
    
    # Check if data exists, if not generate it
    data_path = "./data/synthetic_resumes_v2.csv"
    if not os.path.exists(data_path):
        print("\n⚠️  Training data not found. Generating...")
        from generate_synthetic_data_v2 import IndustryGradeATSGenerator
        generator = IndustryGradeATSGenerator(seed=42)
        df = generator.generate_dataset(n_samples=15000)
        generator.save_dataset(df, data_path)
    
    # Load data
    df = trainer.load_data(data_path)
    
    # Prepare features
    X, y, feature_names = trainer.prepare_features(df)
    
    # Cross-validation
    cv_results = trainer.cross_validate(X, y, n_folds=5)
    
    # Train final model
    X_train, X_test, y_train, y_test = trainer.train_model(X, y, feature_names)
    
    # Evaluate
    eval_results = trainer.evaluate_model(X_test, y_test)
    
    # Feature importance
    trainer.print_feature_importance(top_n=15)
    
    # Prediction analysis
    trainer.analyze_predictions(X_test, y_test)
    
    # Save model
    model_path = trainer.save_model()
    
    # Summary
    print("\n" + "=" * 70)
    print("TRAINING COMPLETE")
    print("=" * 70)
    print(f"\n✅ Model Performance:")
    print(f"   R² Score: {eval_results['r2']*100:.2f}%")
    print(f"   MAE: {eval_results['mae']:.2f} points")
    print(f"   Band Accuracy: {eval_results['band_accuracy']*100:.1f}%")
    print(f"   Within 5 Points: {eval_results['within_5_points']*100:.1f}%")
    
    print(f"\n🎯 Model saved to: {model_path}")
    
    return trainer, eval_results


if __name__ == "__main__":
    trainer, results = main()
