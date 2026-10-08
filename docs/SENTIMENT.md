# Interpreting sentiment

Sentiment runs locally during report generation. A translated AFINN dictionary and emoji scores provide a fast lexical estimate; the report does not send messages to a remote classifier.

The overview includes every message in the current author, channel and date filters. Its four categories are:

- **Positive / negative:** the sum of recognized term scores is above / below zero.
- **Neutral:** at least one sentiment term was recognized, but the resulting score is zero.
- **Not scored:** no supported sentiment dictionary or no recognized sentiment term was available. This is not evidence of neutral tone.

Coverage is the proportion of messages with a score. Both the overview and the percentage timeline use **all messages** as their denominator.

Previously, an unavailable score was written through `NaN` as byte zero and read back as `-128`. This could make most messages appear negative despite having no sentiment evidence. Byte zero is now explicitly reserved for unavailable scores in both message readers. Valid scores use the range -127 to 127, while a balanced score remains zero (encoded as byte 128). Fractional emoji scores are quantized symmetrically away from zero to preserve their polarity.

The byte layout is unchanged. A legacy byte zero cannot distinguish a missing score from a genuine score saturated at -128; regeneration from the source export removes this ambiguity. Old standalone HTML reports contain their old viewer, so regenerate them to apply the correction, matching improvements and updated display.

Matching ignores case and consumes each longest matching phrase once. German matching includes common negators (`kein`, `nie`, etc.), the colloquial variants `ned`, `net`, `nit`, and a small set of spelling aliases (`guad`/`guat`, `schee`, `leiwand`). Aliases inherit existing dictionary weights. Negation is limited to nearby words and resets at punctuation and supported contrast boundaries, such as `aber`/`owa` and `but`. `nicht nur` and `not only` are treated as emphasis rather than negation. These are limited heuristics, not a complete grammar or dialect dictionary.

Word polarity is not the same as a speaker's intention. Sarcasm, friendly insults, quoted criticism, code-switching and conversation history can change the interpretation. Do not use these counts alone to judge a person or a community. A dictionary's zero coverage means it lacks evidence, not that the underlying conversation lacks emotion.
