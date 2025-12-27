#!/usr/bin/env python3
"""
Test script for SBERT grading service
Run this to verify the service is working correctly
"""

import requests
import json
from colorama import init, Fore, Style

init(autoreset=True)

SBERT_URL = "http://localhost:5002"

def print_result(test_name, passed, details=""):
    """Print test result with color"""
    if passed:
        print(f"{Fore.GREEN}✓ {test_name}{Style.RESET_ALL}")
    else:
        print(f"{Fore.RED}✗ {test_name}{Style.RESET_ALL}")
    if details:
        print(f"  {details}")

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{SBERT_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_result("Health Check", True, 
                        f"Model: {data.get('model')}, Status: {data.get('status')}")
            return True
        else:
            print_result("Health Check", False, f"Status code: {response.status_code}")
            return False
    except Exception as e:
        print_result("Health Check", False, f"Error: {str(e)}")
        return False

def test_exact_match():
    """Test exact matching"""
    data = {
        "questionText": "What is the capital of France?",
        "studentAnswer": "Paris",
        "correctAnswer": "Paris",
        "threshold": 0.85
    }
    
    try:
        response = requests.post(f"{SBERT_URL}/grade", json=data, timeout=10)
        result = response.json()
        
        passed = result['isCorrect'] and result['similarityScore'] >= 0.95
        print_result("Exact Match Test", passed,
                    f"Score: {result['similarityScore']:.4f}, Correct: {result['isCorrect']}")
        return passed
    except Exception as e:
        print_result("Exact Match Test", False, f"Error: {str(e)}")
        return False

def test_case_insensitive():
    """Test case insensitive matching"""
    data = {
        "questionText": "What is the capital of France?",
        "studentAnswer": "paris",
        "correctAnswer": "Paris",
        "threshold": 0.85
    }
    
    try:
        response = requests.post(f"{SBERT_URL}/grade", json=data, timeout=10)
        result = response.json()
        
        passed = result['isCorrect'] and result['similarityScore'] >= 0.95
        print_result("Case Insensitive Test", passed,
                    f"Score: {result['similarityScore']:.4f}, Correct: {result['isCorrect']}")
        return passed
    except Exception as e:
        print_result("Case Insensitive Test", False, f"Error: {str(e)}")
        return False

def test_semantic_similarity():
    """Test semantic understanding"""
    data = {
        "questionText": "What is photosynthesis?",
        "studentAnswer": "process where plants make food from sunlight",
        "correctAnswer": "process by which plants convert light energy into chemical energy",
        "threshold": 0.70
    }
    
    try:
        response = requests.post(f"{SBERT_URL}/grade", json=data, timeout=10)
        result = response.json()
        
        passed = result['isCorrect'] and result['similarityScore'] >= 0.70
        print_result("Semantic Similarity Test", passed,
                    f"Score: {result['similarityScore']:.4f}, Correct: {result['isCorrect']}")
        return passed
    except Exception as e:
        print_result("Semantic Similarity Test", False, f"Error: {str(e)}")
        return False

def test_medical_terms():
    """Test medical terminology understanding"""
    data = {
        "questionText": "What is ECG?",
        "studentAnswer": "electrical signal generated from the heart",
        "correctAnswer": "electrocardiogram",
        "threshold": 0.70
    }
    
    try:
        response = requests.post(f"{SBERT_URL}/grade", json=data, timeout=10)
        result = response.json()
        
        passed = result['isCorrect'] and result['similarityScore'] >= 0.70
        print_result("Medical Terms Test", passed,
                    f"Score: {result['similarityScore']:.4f}, Correct: {result['isCorrect']}")
        return passed
    except Exception as e:
        print_result("Medical Terms Test", False, f"Error: {str(e)}")
        return False

def test_incorrect_answer():
    """Test that incorrect answers are marked as incorrect"""
    data = {
        "questionText": "What is the capital of France?",
        "studentAnswer": "London",
        "correctAnswer": "Paris",
        "threshold": 0.85
    }
    
    try:
        response = requests.post(f"{SBERT_URL}/grade", json=data, timeout=10)
        result = response.json()
        
        passed = not result['isCorrect'] and result['similarityScore'] < 0.85
        print_result("Incorrect Answer Test", passed,
                    f"Score: {result['similarityScore']:.4f}, Correct: {result['isCorrect']}")
        return passed
    except Exception as e:
        print_result("Incorrect Answer Test", False, f"Error: {str(e)}")
        return False

def test_empty_answer():
    """Test empty answer handling"""
    data = {
        "questionText": "What is photosynthesis?",
        "studentAnswer": "",
        "correctAnswer": "process by which plants convert light energy",
        "threshold": 0.85
    }
    
    try:
        response = requests.post(f"{SBERT_URL}/grade", json=data, timeout=10)
        result = response.json()
        
        passed = not result['isCorrect'] and result['similarityScore'] == 0.0
        print_result("Empty Answer Test", passed,
                    f"Score: {result['similarityScore']:.4f}, Correct: {result['isCorrect']}")
        return passed
    except Exception as e:
        print_result("Empty Answer Test", False, f"Error: {str(e)}")
        return False

def test_batch_grading():
    """Test batch grading endpoint"""
    data = {
        "threshold": 0.85,
        "answers": [
            {
                "questionText": "Capital of France?",
                "studentAnswer": "Paris",
                "correctAnswer": "Paris"
            },
            {
                "questionText": "Capital of Germany?",
                "studentAnswer": "Berlin",
                "correctAnswer": "Berlin"
            }
        ]
    }
    
    try:
        response = requests.post(f"{SBERT_URL}/batch-grade", json=data, timeout=10)
        result = response.json()
        
        passed = 'results' in result and len(result['results']) == 2
        if passed:
            correct_count = sum(1 for r in result['results'] if r['isCorrect'])
            print_result("Batch Grading Test", passed,
                        f"Graded {len(result['results'])} answers, {correct_count} correct")
        else:
            print_result("Batch Grading Test", False, "Invalid response format")
        return passed
    except Exception as e:
        print_result("Batch Grading Test", False, f"Error: {str(e)}")
        return False

def main():
    """Run all tests"""
    print(f"\n{Fore.CYAN}{'='*60}")
    print(f"SBERT Grading Service Test Suite")
    print(f"{'='*60}{Style.RESET_ALL}\n")
    
    print(f"{Fore.YELLOW}Testing SBERT service at: {SBERT_URL}{Style.RESET_ALL}\n")
    
    tests = [
        ("Health Check", test_health),
        ("Exact Match", test_exact_match),
        ("Case Insensitive", test_case_insensitive),
        ("Semantic Similarity", test_semantic_similarity),
        ("Medical Terms", test_medical_terms),
        ("Incorrect Answer", test_incorrect_answer),
        ("Empty Answer", test_empty_answer),
        ("Batch Grading", test_batch_grading),
    ]
    
    results = []
    for test_name, test_func in tests:
        result = test_func()
        results.append(result)
        print()
    
    # Summary
    passed = sum(results)
    total = len(results)
    
    print(f"{Fore.CYAN}{'='*60}")
    print(f"Test Summary")
    print(f"{'='*60}{Style.RESET_ALL}")
    print(f"\n{Fore.GREEN if passed == total else Fore.YELLOW}Passed: {passed}/{total}{Style.RESET_ALL}")
    
    if passed == total:
        print(f"\n{Fore.GREEN}✓ All tests passed! SBERT service is working correctly.{Style.RESET_ALL}")
    else:
        print(f"\n{Fore.YELLOW}⚠ Some tests failed. Check the output above.{Style.RESET_ALL}")
    
    print()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Fore.YELLOW}Tests interrupted by user{Style.RESET_ALL}")
    except Exception as e:
        print(f"\n{Fore.RED}Unexpected error: {str(e)}{Style.RESET_ALL}")
