---
layout: post
title:  "Formatted post"
date:   2022-01-13 09:00:00 +0900
author: me
tags: update
category: test, Android
---

# 제목1

## 제목 1-1

### 개요  

Ea veniam duis amet laboris ut. In ad reprehenderit `est` duis adipisicing id magna mollit qui ut `amet` occaecat. Elit dolore cillum ex veniam officia sint.  

```python
for i in range(5):
    print(i)
```

Excepteur `sit` aliqua consectetur ex eiusmod excepteur qui aliquip non cupidatat et ut. Nostrud labore est do id enim. Laboris labore Lorem elit non tempor amet consectetur esse sit Lorem aliquip.  

```kotlin
import kotlin.math.absoluteValue
// 한글 주석
fun main() {
    val n = readLine()!!.toInt()
    val pq = PriorityQue()
    for (i in 1..n) {
        val input = readLine()!!.toInt()
        if (input == 0)
            println(pq.remove())
        else
            pq.add(input)
    }
}

class PriorityQue{
    private val list = mutableListOf<Int>()

    fun add(input: Int) {
        list.add(input)
        var prev = list.lastIndex
        var pos = (list.lastIndex - 1) / 2
        while (pos >= 0) {
            val posVal = list[pos]
            val prevVal = list[prev]
            val posAbs = posVal.absoluteValue
            val prevAbs = prevVal.absoluteValue
            if (posAbs > prevAbs || (posAbs == prevAbs && posVal > prevVal)) {
                list[pos] = prevVal
                list[prev] = posVal
                prev = pos
                pos = (pos - 1) / 2
            } else break
        }
    }

    fun remove(): Int {
        when (list.size) {
            0 -> return 0
            1 -> return list.removeLast()
        }
        val ans = list[0]
        list[0] = list.removeLast()
        var pos = 1
        var prev = 0
        while (pos <= list.lastIndex) {
            val posVal = list[pos]
            val posAbs = posVal.absoluteValue
            val pos1Abs = list.elementAtOrNull(pos + 1)?.absoluteValue ?: Int.MAX_VALUE
            val minPos = if (posAbs < pos1Abs || (posAbs == pos1Abs && posVal < 0)) pos else pos + 1
            val minVal = list[minPos]
            val minAbs = minVal.absoluteValue
            val prevVal = list[prev]
            val prevAbs = prevVal.absoluteValue
            if (minAbs < prevAbs || (minAbs == prevAbs && minVal < prevVal)) {
                list[minPos] = prevVal
                list[prev] = minVal
                prev = minPos
                pos = minPos * 2 + 1
            } else break
        }
        return ans
    }
}
```

- something
- wow
- real
- power

| 표 | 1번 | 2번 |
|---|---|---|
| 좌 | 60% | 40% |
| 중 | 50% | 50% |
| 우 | 40% | 60% |

Anim Lorem elit exercitation consectetur ea deserunt eiusmod fugiat et Lorem ex commodo pariatur. Excepteur sint consectetur est irure Lorem excepteur consectetur est ea. Et ullamco culpa deserunt ea non adipisicing aliquip. Nulla pariatur cillum ea est ea officia id. Laborum labore est dolore aute sint do. Occaecat laborum adipisicing ea dolore.

* banana
* apple
* mango

Do in in ullamco et quis sint laboris proident nostrud ullamco. Pariatur quis ea amet dolore reprehenderit laboris officia. Est et officia pariatur non. Pariatur voluptate ex officia ut irure ullamco. Exercitation qui ullamco occaecat pariatur laborum ea. Minim adipisicing magna excepteur fugiat magna et sit eu ut mollit cillum commodo.

> Reprehenderit `commodo` laborum incididunt amet eiusmod voluptate dolor magna ea sint. Quis duis duis officia tempor do reprehenderit do ad aliquip elit qui. In et esse aliqua ad aliqua labore pariatur dolor.

Do ea veniam occaecat ullamco tempor aliquip voluptate dolor. Aute proident ad quis minim commodo tempor amet duis laboris excepteur ipsum ut esse velit. Dolor minim incididunt occaecat nulla ut nostrud eu officia deserunt veniam. Veniam reprehenderit aliqua dolor tempor laboris ut elit esse duis sunt eiusmod aliquip magna. Tempor commodo aute occaecat enim voluptate enim eiusmod irure officia fugiat ullamco est sit.

Elit est aliquip labore sunt officia sit excepteur nulla voluptate esse sint laborum aliquip sunt. Nostrud aliqua exercitation magna ipsum. Cillum sint sint anim occaecat veniam ullamco laboris ullamco adipisicing incididunt ipsum reprehenderit.

Amet aliquip reprehenderit qui officia incididunt commodo qui sint. Est duis cillum aliquip proident minim. Voluptate elit deserunt ad ea eu anim minim eiusmod irure adipisicing elit. Elit occaecat aliquip laborum id culpa irure laborum consectetur.

Amet dolore esse amet sit exercitation laborum ipsum anim. Enim esse mollit mollit et non cillum. Ea ipsum dolore deserunt pariatur magna irure laborum.

Est ipsum occaecat nulla adipisicing magna voluptate velit aliqua pariatur duis exercitation incididunt voluptate et. Eu et culpa tempor eiusmod ea culpa ea culpa. Officia ea nostrud deserunt officia. Tempor nulla labore do commodo.

> Irure quis mollit `commodo` Lorem incididunt `veniam` ea culpa qui minim cillum. Id reprehenderit nostrud eu occaecat ut ipsum ut eu irure. Dolor cillum pariatur anim mollit. Aute cupidatat est proident veniam dolore non aliquip adipisicing esse adipisicing sint ea.

```text
cd $HOME
```

Quis occaecat ipsum proident commodo ad fugiat. Id nulla ipsum culpa fugiat duis aliquip excepteur incididunt. Proident officia consectetur et reprehenderit ad qui ad. Incididunt excepteur ad Lorem duis laboris commodo officia. Adipisicing proident veniam nisi dolor culpa nulla consequat elit nisi Lorem excepteur aliquip et. Dolor aute qui incididunt enim qui. Ea ullamco incididunt elit anim eiusmod velit voluptate sint consectetur. 

### 3번도 될까요?

Veniam labore aliquip qui consequat reprehenderit sunt exercitation. Enim sit occaecat consequat est pariatur cillum. Nisi eiusmod aliquip aliqua pariatur quis eiusmod magna culpa officia amet dolor amet mollit. Aliquip sit laborum voluptate dolore. Mollit sit amet proident sint irure deserunt laboris id anim qui esse. Fugiat quis officia esse laborum officia eiusmod enim duis aliquip aliqua reprehenderit consectetur voluptate qui.

Pariatur tempor exercitation labore ut minim pariatur magna culpa consectetur labore consectetur esse duis. Fugiat est id minim fugiat esse ut enim deserunt consectetur occaecat. Cupidatat nisi sunt ut ea nulla nostrud exercitation ea ea id. Mollit veniam ex esse id commodo consequat voluptate. Sint tempor non aliquip exercitation laborum reprehenderit quis eiusmod. Mollit et nulla culpa quis nostrud commodo velit ea.

Ex cillum pariatur deserunt velit ea occaecat cillum excepteur quis Lorem labore ut velit id. Occaecat pariatur cupidatat commodo ex officia officia quis consequat exercitation nulla est. Ipsum dolore non dolor duis. Sunt nisi incididunt proident mollit elit esse in ut aliquip. Ad eiusmod voluptate nostrud veniam officia elit aute voluptate laboris quis sit qui dolor ex. Exercitation nisi incididunt mollit officia culpa est incididunt laborum irure proident nisi irure qui aliqua.

## 제목 1-2 

Do est id ea et dolor duis aute quis mollit. Sit mollit ipsum tempor velit minim laborum quis commodo. Incididunt id velit mollit laboris cupidatat voluptate non veniam sunt enim dolore id excepteur. Ex anim dolor sit do Lorem nostrud. Ullamco magna et ex fugiat laboris commodo non do dolore laboris veniam enim. Est mollit aliquip consequat labore nulla duis exercitation. Magna in duis sit aliquip ex commodo in mollit Lorem.

Consectetur nisi Lorem ullamco dolore ex. Est deserunt et cupidatat commodo esse cupidatat incididunt nostrud. Pariatur do anim magna dolor quis eiusmod sit deserunt velit ut culpa occaecat.

Eu id cillum do ullamco nisi sunt labore occaecat cillum minim. Aute aliqua aliqua incididunt laboris labore veniam Lorem officia eu ea eiusmod qui. Anim eu tempor occaecat deserunt minim elit elit.

Non adipisicing cupidatat ipsum nostrud pariatur labore minim incididunt adipisicing nostrud. Consectetur pariatur adipisicing excepteur ex deserunt quis laboris. Non excepteur ut nostrud est ex ex id id proident commodo. Amet reprehenderit pariatur consequat sit reprehenderit ut aute fugiat irure minim labore aliqua commodo elit. Magna deserunt consectetur anim id dolor ullamco magna labore do ea velit laboris commodo. Ipsum ea anim duis et. Sit duis adipisicing duis irure laboris esse anim ex culpa veniam.

Deserunt nisi est aute ullamco anim anim ipsum excepteur eiusmod aliqua irure excepteur eu sint. Pariatur duis proident laborum laboris commodo nisi voluptate sit mollit anim Lorem pariatur duis et. Exercitation eiusmod ut deserunt amet excepteur incididunt adipisicing. Reprehenderit nostrud nulla do nisi culpa laboris id occaecat laboris.

In nostrud cillum laboris dolor ex velit officia laborum commodo duis. Reprehenderit ipsum labore elit proident. Sunt dolore sint amet duis consectetur sunt cupidatat fugiat culpa et.

Voluptate et dolor laborum ea nisi culpa commodo. Magna id sit mollit minim aute eiusmod Lorem. Deserunt labore consectetur proident nulla. Id sint est proident non nulla esse tempor. Officia consequat eiusmod culpa anim. Qui ea occaecat incididunt dolore Lorem ex. Tempor do eu officia anim do duis nisi ea eiusmod ad velit officia.

Adipisicing veniam ad eu excepteur deserunt fugiat irure consequat anim incididunt deserunt veniam. Ipsum commodo velit officia sint veniam in non est mollit irure amet consectetur duis culpa. Laborum ad aliqua fugiat ea qui culpa ea veniam. Reprehenderit irure esse et sunt nisi deserunt. Nulla cupidatat sunt amet ipsum consequat elit Lorem dolore. Eu anim laboris mollit ea. Dolore dolor nulla anim qui eiusmod magna proident.

Enim laborum sunt sit ullamco dolore laboris aliqua. Eu culpa excepteur nisi laborum enim non ex amet irure adipisicing. Amet sit consectetur dolor non ullamco magna. Voluptate ullamco pariatur voluptate et. Occaecat sit qui ad cillum fugiat culpa consequat ea deserunt ipsum incididunt eiusmod. Aliquip aliqua qui ad laborum eiusmod commodo culpa adipisicing.

Pariatur minim fugiat eiusmod adipisicing consequat reprehenderit voluptate labore non velit minim eiusmod. Cillum laborum id do eu laboris officia voluptate. Magna laborum deserunt cillum elit occaecat. Deserunt ipsum occaecat incididunt minim sint.

Enim nostrud voluptate minim est quis proident. Consequat cillum reprehenderit cupidatat cillum laboris ad. Anim magna nulla culpa nisi qui laboris qui. Non consectetur velit do labore aute amet excepteur culpa est.

Elit est id eiusmod exercitation aliqua ad proident deserunt officia. Ullamco excepteur esse non exercitation dolore. Ipsum pariatur et nostrud ut proident nostrud cillum ea. Commodo enim velit laborum fugiat enim eu nisi anim sunt officia amet mollit.

Do irure laboris labore occaecat non deserunt proident esse minim quis deserunt reprehenderit sunt. Excepteur adipisicing aliqua amet exercitation aliquip exercitation. Est anim aliqua dolore esse veniam voluptate exercitation commodo sunt dolore.

# 제목2

## 제목 2-1

Ea esse fugiat tempor minim labore dolore laboris nulla est aute. Adipisicing veniam in id Lorem incididunt et ullamco. Mollit irure laborum anim mollit exercitation pariatur nisi. Incididunt duis voluptate cupidatat aliqua enim do adipisicing elit laboris ullamco nulla. Aliquip reprehenderit aliquip cupidatat excepteur voluptate laborum est culpa aute commodo mollit amet adipisicing elit.

Est ea eu adipisicing incididunt laboris cupidatat est. Commodo minim laboris adipisicing tempor et ad ut sint esse. Nisi et fugiat culpa eiusmod exercitation consectetur elit reprehenderit.

Nostrud velit fugiat magna pariatur exercitation nulla eu aliquip mollit occaecat. Enim quis aliqua laboris Lorem sint mollit irure Lorem sint laboris excepteur. Magna qui culpa minim culpa nulla commodo cillum sint officia voluptate. Incididunt sunt nisi dolor nulla in est veniam labore velit qui.

Fugiat adipisicing Lorem proident nisi dolor. Enim nisi sit sunt consectetur quis nostrud. Ea officia voluptate aliqua labore tempor id pariatur mollit reprehenderit consequat sunt aliquip culpa est. Enim elit do nulla dolor consectetur veniam proident.

Sunt aute non mollit aute sint commodo sint id ullamco est deserunt commodo. Dolor incididunt ullamco irure occaecat eiusmod minim enim dolore do excepteur. Sit ipsum in cillum nisi laboris adipisicing veniam pariatur cupidatat veniam incididunt nostrud. Esse excepteur sunt sit ea enim nulla reprehenderit ipsum Lorem sunt aliquip minim ex. Laborum dolore commodo deserunt duis consectetur adipisicing excepteur laboris reprehenderit amet officia incididunt. Ullamco cupidatat est deserunt et ut anim magna dolore exercitation eiusmod magna magna et voluptate. Nisi eiusmod nisi exercitation ad tempor qui aliqua et sit ut esse ipsum.

Fugiat consectetur consectetur non dolor ut consequat exercitation tempor eiusmod laborum ut. Sit qui nisi mollit ipsum. Ut in do occaecat veniam ullamco et dolore veniam nulla veniam exercitation Lorem. Commodo incididunt aliquip quis elit irure consectetur nulla.

Dolore exercitation anim exercitation commodo esse pariatur anim quis. Do pariatur amet sit Lorem anim enim dolore elit ad sit. Veniam labore deserunt ea proident cupidatat. Id Lorem pariatur nostrud aliquip fugiat culpa ad dolor. Mollit proident cillum id ullamco id laboris reprehenderit Lorem mollit anim exercitation ad. Est et duis esse ullamco ullamco. Voluptate fugiat deserunt incididunt amet culpa minim deserunt.

Aute fugiat nisi adipisicing cillum eu velit officia minim consectetur commodo magna eiusmod dolore. Mollit velit commodo nostrud id id velit enim do culpa. Est occaecat commodo nostrud dolore quis do id reprehenderit eu nisi aliqua. Labore ex eiusmod culpa est consequat ut dolor excepteur qui laboris.

Esse irure pariatur commodo minim nostrud adipisicing eiusmod duis incididunt do est. Do Lorem exercitation ad aute Lorem. Magna consectetur magna sint incididunt cupidatat tempor enim sit ad mollit cupidatat.

## 제목 2-2 

Elit commodo Lorem do esse cupidatat. Ut enim sit exercitation velit tempor sunt voluptate exercitation. Magna labore ipsum pariatur nulla consectetur aliquip elit adipisicing dolore qui. Nostrud sunt mollit commodo exercitation et elit ea laborum voluptate qui ut ipsum. Voluptate consectetur minim velit cupidatat esse.

Aliqua labore id tempor reprehenderit est aute eu voluptate consequat. Commodo voluptate magna commodo laboris et magna enim esse sint esse. Qui veniam do ipsum voluptate nisi enim voluptate irure voluptate nulla sint velit irure. Tempor voluptate tempor id tempor Lorem sunt voluptate ipsum duis eiusmod aute est do. Nulla ut esse amet nostrud ullamco ut mollit. Veniam sunt aute velit magna anim ipsum in dolore. Incididunt dolor dolor sunt id sint exercitation et esse duis qui velit adipisicing.

Ipsum et laborum sunt exercitation irure consectetur. Non eiusmod exercitation fugiat dolor. Labore ullamco aliqua tempor cillum qui culpa ad pariatur.

Elit culpa Lorem et in excepteur enim dolore duis qui adipisicing. Elit aute aute sunt magna ad nisi sint exercitation nulla nisi veniam id sit do. Esse duis irure deserunt occaecat deserunt nulla excepteur dolor ut cupidatat fugiat nulla. Exercitation velit quis exercitation laboris deserunt.

Aliquip commodo laboris aute dolor esse ad tempor laborum. Dolor incididunt ea sunt laboris dolore officia adipisicing elit velit aliquip nisi. Aute sunt anim minim duis nulla ad incididunt incididunt occaecat tempor. In elit consequat cillum aliquip anim dolore non aliqua dolor labore quis dolore do. Ipsum elit culpa non exercitation commodo irure cillum id mollit exercitation ullamco mollit pariatur. Incididunt est ea ullamco commodo reprehenderit cupidatat.

Culpa consectetur laboris exercitation irure dolore id eiusmod fugiat excepteur anim in. Consectetur reprehenderit anim adipisicing id commodo nisi voluptate duis sunt commodo adipisicing sit ipsum cupidatat. Veniam nostrud elit consectetur occaecat excepteur excepteur reprehenderit aliquip aliquip officia. Enim ullamco ad nisi ut in commodo reprehenderit enim officia anim culpa excepteur deserunt. Cupidatat fugiat aliqua sit ad minim sit tempor ullamco reprehenderit eu elit enim. Excepteur occaecat elit sint quis consectetur do minim proident adipisicing et ea minim id minim.

Cillum laboris nulla sint id in magna. Ullamco laboris tempor sunt elit. Commodo eiusmod pariatur nisi ullamco labore aliqua eiusmod laboris minim commodo do. Nostrud anim ea irure aute sit laborum laborum. Et cillum nulla fugiat esse commodo.

Tempor ut duis do minim nostrud amet est ad. Dolore non fugiat eiusmod aliquip sit irure mollit. Elit dolore excepteur magna ullamco do qui nulla voluptate. Eu occaecat dolore reprehenderit labore sit sit magna. Incididunt in minim sunt cupidatat tempor nisi Lorem eu nulla. Labore enim exercitation nulla non quis adipisicing commodo do. Est labore aliqua amet nulla consequat minim.