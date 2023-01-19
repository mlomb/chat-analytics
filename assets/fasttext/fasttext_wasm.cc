#include <emscripten.h>
#include <emscripten/bind.h>
#include <fasttext.h>
#include <functional>
#include <sstream>
#include <string>
#include <vector>

using namespace emscripten;
using namespace fasttext;


std::vector<std::pair<float, std::string>>
predict(FastText* fasttext, std::string text, int k, double threshold) {
  std::stringstream ioss(text + std::string("\n"));

  std::vector<std::pair<float, std::string>> predictions;
  fasttext->predictLine(ioss, predictions, k, threshold);

  return predictions;
}

EMSCRIPTEN_BINDINGS(fasttext) {
  class_<FastText>("FastText")
      .constructor<>()
      .function(
          "loadModel",
          select_overload<void(const std::string&)>(&FastText::loadModel))
      .function("predict", &predict, allow_raw_pointers());

  emscripten::value_array<std::pair<float, std::string>>(
      "std::pair<float, std::string>")
      .element(&std::pair<float, std::string>::first)
      .element(&std::pair<float, std::string>::second);

  emscripten::register_vector<std::pair<float, std::string>>(
      "std::vector<std::pair<float, std::string>>");
}
