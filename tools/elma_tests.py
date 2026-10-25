"""Five additive test courses about wheel placement, hanging and direction changes.
Uses existing steel/wood terrain semantics; never modifies the physics engine.
"""
from varied_trials import course, profile, smooth, arc
from shapely.geometry import box
from shapely.ops import unary_union

def make_elma_tests():
    result=[]
    def add(name,p,stars,finish,start,rails=(),route=None,**kw):
        air=profile(p).difference(unary_union([box(x,y-.24,x+w,y) for x,y,w in rails]))
        l=course(name,p,stars,finish,start,rings=air,kind='elma-wheel-test',**kw)
        # Existing steel allows the rider through while the tyres remain supported.
        l['rings']=[{'pts':[[round(x,4),round(y,4)]for x,y in list(profile(p).exterior.coords)[:-1]]},*[{'pts':[[x,y],[x+w,y],[x+w,y-.24],[x,y-.24]],'style':'steel'}for x,y,w in rails]]
        l['noDeco']=True
        l['campaignId']='elma-test-v1-'+str(len(result)+1)
        l['design'].update(route=route or [start,finish],features=['wheel-placement','turnaround','hang'],testPack=True)
        result.append(l)
        return l
    p=[[-8,5],[10,5],[10,0],[43,0]]
    add('Test 1 – Hängskolan',p,[[7,5.75],[21,3.35],[33,.75]],[38,0],[1,5],rails=[(10,5,14)],difficulty='Medel',hint='Kör ut på balken. Bromsa med ett däck kvar på kanten och luta ner huvudet till stjärnan UNDER balken. VÄND för grepp och släpp sedan ner på marken. Ingen gravitationsstjärna.')
    # A shelf with two stars: one on top, one underneath. Finish behind start.
    p=smooth([[-8,0],[6,0],[16,3],[22,3],[24,0],[48,0]])
    add('Test 2 – Ovanpå och under',p,[[20,3.75],[34,1.35],[42,.75]],[0,0],[3,0],rails=[(22,3,15)],difficulty='Medel / svår',hint='Ta rampen upp och kör på hyllan. Vid högerkanten: bromsa, vrid ner cykeln och ta stjärnan UNDER hyllan. Ta stjärnan längst bort och VÄND tillbaka till blomman bakom starten.')
    # A 1.30m opening fits a 0.80m tyre, not a horizontal 2.72m bike.
    p=[[-8,0],[45,0]]
    l=add('Test 3 – Däck för däck',p,[[5,7.75],[15,4.75],[29,.75]],[38,0],[0,7],rails=[(-6,7,14),(9.3,7,12),(8,4,15)],difficulty='Svår',hint='Öppningen mellan de två översta hyllorna är 1,30 m. Bromsa vid kanten och vrid cykeln så däcken går igenom ETT I TAGET. Landa på mellanplanet, vänd åt höger och fortsätt ner.')
    l['design']['wheelGate']={'left':8,'right':9.3,'width':1.3,'wheelDiameter':.8}
    # Three separate cantilevers: the line doubles back on itself at each drop.
    p=[[-8,0],[49,0]]
    add('Test 4 – Tre krokar',p,[[27,9.75],[17,7.35],[11,5.75],[29,3.35],[39,.75]],[44,0],[3,9],rails=[(-5,9,25),(20,9,11),(7,5,26)],difficulty='Expert',hint='Kör höger på översta hyllan. Häng ner vid slutet och ta stjärnan under. Släpp till nästa hylla, VÄND åt vänster och häng över vänsterkanten. Vänd igen på marken och kör höger till mål.')
    # A bowl accelerates towards a lip; the upper/lower route rejoins at the left.
    bowl=arc(16,5,8,5,205,335,48);lip=bowl[0][1]
    p=[[-8,lip],[5,lip],*bowl,[27,lip],[40,-3],[49,-3]]
    add('Test 5 – Skålen och returen',p,[[16,.75],[31,lip+.75],[36,lip-1.65],[44,-2.25]],[0,lip],[1,lip],rails=[(27,lip,12)],difficulty='Expert',hint='Ta fart genom skålen och upp på den smala hyllan. Vid änden: bromsa, vrid ner och plocka stjärnan UNDER. Släpp ner till sista stjärnan. VÄND och följ den långa rampen upp, tillbaka genom skålen till starten.')
    return result
