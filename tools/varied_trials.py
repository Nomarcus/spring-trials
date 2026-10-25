"""Distinct, authored trials courses to interleave with the long maze campaign."""
import math
from shapely.geometry import Polygon, Point, box
from shapely.ops import unary_union

def smooth(points, spacing=.5):
    result=[points[0]]
    for a,b in zip(points,points[1:]):
        n=max(1,math.ceil((b[0]-a[0])/spacing))
        for i in range(1,n+1):
            u=i/n;t=(1-math.cos(math.pi*u))/2
            result.append([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*t])
    return result

def arc(cx,cy,rx,ry,a,b,n=64):
    return [[cx+rx*math.cos(math.radians(a+(b-a)*i/n)),cy+ry*math.sin(math.radians(a+(b-a)*i/n))] for i in range(n+1)]

def y_at(points,x):
    for a,b in zip(points,points[1:]):
        if a[0]<=x<=b[0] and b[0]-a[0]>1e-8:return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0])
    raise ValueError(x)

def profile(points):
    return Polygon([[points[0][0],65],*points,[points[-1][0],65]])

def contour(ring):return [[round(x,4),round(y,4)]for x,y in list(ring.coords)[:-1]]

def course(name,points,stars,finish,start,*,direction=1,theme='meadow',hint='',difficulty='Medel',kind='flow',holes=None,rings=None):
    air=profile(points) if rings is None else rings
    air=air.buffer(0).simplify(.006,preserve_topology=True)
    assert air.geom_type=='Polygon',name
    feet_y=start[1]
    for item in stars:
        x,y=item[:2]
        assert air.contains(Point(x,y)),(name,'buried star',x,y)
        assert air.boundary.distance(Point(x,y))>.3,(name,'star clearance',x,y)
    for x in [start[0]-.96,start[0]+.96]:assert air.contains(Point(x,feet_y+.4)),(name,'wheel spawn')
    assert air.contains(Point(start[0],feet_y+1.8)),(name,'head spawn')
    assert air.contains(Point(finish[0],finish[1]+.65)),(name,'flower')
    route=[start,*[[a[0],y_at(points,a[0])]for a in stars],finish] if rings is None else [start,finish]
    length=sum(math.dist(a,b)for a,b in zip(route,route[1:]))
    gold=max(20,round(length/3.5+12))
    clear=kind in ['half-circle','double-bowl','wheel-docks','precision-turnaround','precision-pillars','wheel-hang','islands','vertical-descent','low-tunnel','gravity-oval']
    return dict(name=name,theme=theme,hint=hint,rings=[{'pts':contour(air.exterior)},*[{'pts':contour(r)}for r in air.interiors]],apples=stars,killers=[],flower=finish,start=start,startDir=direction,noDeco=clear,medal=[gold,math.ceil(gold*1.7)],difficulty=difficulty,campaignId='trials-v1-'+name.lower().replace(' ','-'),design=dict(floors=1,branches=0,route=route,routeLength=round(length,1),features=[],kind=kind,wheelSlots=holes or []))

def make_trials():
    additions={}
    # A forgiving circular bowl, open sky and wide recovery pads.
    bowl=arc(16,3.2,8,3.2,200,340);lip=bowl[0][1]
    p=[[-8,lip],[6,lip],*bowl,[27,lip],[34,lip]]
    additions[2]=course('Skålens rytm',p,[[6,lip+.75],[16,.75],[27,lip+.75]],[31,lip],[2,lip],hint='Rulla ner i den breda skålen och behåll farten upp. Luta framåt nära kanten. Hela skålen är körbar.',difficulty='Lätt',kind='half-circle')
    # Broad, flowing descent with smooth, speed-friendly landing transitions.
    p=smooth([[-8,13],[6,13],[20,9],[32,10],[46,5],[59,6],[75,1],[89,1],[105,-1],[114,-1]])
    additions[4]=course('Medvinden',p,[[x,y_at(p,x)+.75]for x in [20,46,75,101]],[110,-1],[2,13],hint='En lång fartbana nedför. Släpp gasen före krönen och låt hjulen följa de mjuka dalarna.',difficulty='Lätt',kind='downhill-flow')
    # Start on the right, already facing the direction of the journey.
    p=smooth([[-8,0],[6,0],[18,.4],[34,2.4],[49,3.2],[65,6],[78,6],[88,6]])
    additions[5]=course('Vänstervägen',p,[[x,y_at(p,x)+.75]for x in [61,39,17]],[0,0],[80,6],direction=-1,hint='Du börjar till höger och kör åt VÄNSTER. Följ dalen hela vägen till blomman.',difficulty='Lätt',kind='leftward')
    # No obligatory drops: a genuine ascending route, with flat rest pads.
    p=smooth([[-8,0],[7,0],[21,2.7],[27,2.7],[43,6.2],[50,6.2],[67,10],[74,10],[92,14],[100,14],[118,18],[129,18]])
    additions[7]=course('Bergsbestigaren',p,[[x,y_at(p,x)+.75]for x in [24,46,71,96,121]],[125,18],[2,0],hint='Den här banan går bara UPPÅT. Ta paus på terrasserna och flytta vikten framåt i backarna.',difficulty='Medel',kind='uphill')
    p=smooth([[-8,-6],[6,-6],[17,-4],[27,-1],[40,3],[54,9],[67,14],[77,18],[91,18]])
    additions[9]=course('Rutschkanan',p,[[x,y_at(p,x)+.75]for x in [71,51,30,12]],[0,-6],[83,18],direction=-1,theme='sunset',hint='Bara nedför, från höger till vänster. Dosera BROMS så cykeln håller sig på hjulen.',difficulty='Medel',kind='downhill')
    # A deeper true semicircle followed by a short landing/turning plateau.
    bowl=arc(20,8.5,8.5,8.5,180,360,80)
    p=[[-8,8.5],[8.5,8.5],[11.5,8.5],*bowl[1:],[34,8.5],[38,8.5]]
    additions[11]=course('Halvmånen',p,[[8,9.25],[20,.75],[32,9.25]],[35,8.5],[2,8.5],theme='sunset',hint='Ner i en riktig halvcirkel och upp på kanten igen. Behåll farten, luta framåt och få upp båda hjulen.',difficulty='Medel / svår',kind='half-circle')
    # Wheel docks are just terrain: original 0.4m-radius wheel collisions do all the work.
    def docks(deep):
        w,depth=(1.10,.9) if deep else (1.28,.62)
        centres=[25,26.92];points=[[-8,0],[8,0],[15,.6],[20,0],[centres[0]-w/2,0]]
        for i,c in enumerate(centres):
            r=w/2;cy=-depth+r
            points.extend([[c-r,cy],*arc(c,cy,r,r,180,360,18)[1:],[c+r,0]])
            if i==0:points.append([centres[1]-r,0])
        points.extend([[33,0],[40,0]])
        return points,[dict(x=c,width=w,depth=depth)for c in centres]
    p,slots=docks(False)
    additions[13]=course('Tandemgreppet',p,[[14,1.25],[25,.1],[26.92,.1]],[36,0],[2,0],holes=slots,hint='Två urtag med samma avstånd som hjulaxlarna. Rulla sakta ner med däcken, bromsa och lyft framhjulet för att komma loss.',difficulty='Medel',kind='wheel-docks')
    # The finish is behind the start. Reaching the lip is only half the journey.
    p=[[-8,5],[6,5],*arc(14,5,6,5,180,360,56),[26,5],[29,5],[30,2],[40,2],[40,65]]
    additions[15]=course('Vändkroken',p,[[14,.75],[25,5.75],[28,5.75]],[0,5],[3,5],theme='meadow',hint='Ta sats i skålen, sätt upp däcken på hyllan och VÄND på platån. Blomman står bakom starten. Låt inte framhjulet rulla över stupet.',difficulty='Svår',kind='turnaround')
    # Two bowls with an easy middle connection; a continuous rhythm rather than a tunnel.
    first=arc(13,5,8,5,200,340,60);second=arc(37,5,8,5,200,340,60);lip=first[0][1]
    p=[[-8,lip],[4,lip],*first,[28,lip],*second,[54,lip],[66,lip]]
    additions[18]=course('Två snabba bågar',p,[[13,.75],[25,lip+.75],[37,.75],[54,lip+.75]],[62,lip],[1,lip],theme='sunset',hint='Två stora skålar i följd. Pumpa i dalarna och hitta rytmen så att farten följer med över mittplatån.',difficulty='Svår',kind='double-bowl')
    p=smooth([[-8,21],[6,21],[20,17],[27,17],[43,12],[51,12],[68,7],[76,7],[93,3],[101,3],[115,0],[127,0]])
    additions[21]=course('Toppen från höger',p,[[x,y_at(p,x)+.75]for x in [97,72,47,24]],[0,21],[120,0],direction=-1,theme='winter',hint='Börja nere till höger och klättra åt VÄNSTER hela vägen. Ingen nedfart – bara uppför och breda viloplatser.',difficulty='Svår',kind='leftward-uphill')
    p,slots=docks(True)
    additions[24]=course('Hjulnyckeln',p,[[14,1.25],[25,-.55],[26.92,-.55]],[0,0],[4,0],holes=slots,theme='cave',hint='Stjärnorna ligger nere i hjulfickorna. Rulla ner däcken i urtagen, ta båda och lyft dig loss. VÄND sedan tillbaka till blomman.',difficulty='Expert',kind='precision-turnaround')
    # Primarily vertical. Four-metre drops and wide shelves, rather than long parallel tunnels.
    outer=box(-7,-3,25,40)
    solids=[box(-7,-3,25,-.01)]
    top_shelf=box(3,31.25,23,32)
    solids.append(top_shelf)
    # Alternating, disconnected floating ledges: open space on both ends.
    ledges=[]
    for i in range(1,9):
        y=32-i*3.5
        x0,x1=(0,12)if i%2 else (8,21)
        ledges.append(box(x0,y-.65,x1,y))
    solids.extend(ledges)
    air=outer.difference(unary_union(solids))
    p=[[-7,0],[25,0]]
    stars=[[4,29.25],[17,25.75],[4,15.25],[17,4.75]]
    additions[27]=course('Schaktets fall',p,stars,[3,0],[17,32],direction=-1,theme='cave',rings=air,hint='Starta högst upp och kör åt vänster. Bromsa och släpp dig ner hylla för hylla. Den här banan går nästan bara NEDÅT.',difficulty='Expert',kind='vertical-descent')
    route=[[17,32],*[[6 if i%2 else 15,32-i*3.5]for i in range(1,9)],[3,0]]
    additions[27]['design'].update(route=route,routeLength=round(sum(math.dist(a,b)for a,b in zip(route,route[1:])),1))
    # Short rolling course: low amplitude, no cave roof and no mandatory turn.
    p=smooth([[-8,0],[6,0],[12,.4],[18,0],[24,.55],[30,0],[36,.6],[42,0],[48,.7],[54,0],[66,0]])
    additions['pump']=course('Pumpstranden',p,[[x,y_at(p,x)+.75]for x in [14,33,51]],[62,0],[2,0],hint='Låga vågor och fri sikt. Hitta rytmen med vikten och låt hjulen följa marken.',difficulty='Mycket lätt',kind='rollers')
    p=smooth([[-8,0],[7,0],[20,3],[29,.2],[44,5.5],[55,1],[66,1]])
    additions['peaks']=course('Tvillingtopparna',p,[[20,3.75],[44,6.25],[58,1.75]],[62,1],[2,0],hint='Två olika toppar. Första kan rullas över; till den andra behöver du behålla farten i dalen.',difficulty='Lätt',kind='twin-peaks')
    floor=smooth([[-8,2],[5,2],[8,-4],[50,-4],[57,3],[65,3]])
    islands=[Polygon([[x,y],[x+w,y+.2],[x+w-.6,y-1],[x+1,y-1.6]])for x,y,w in [(7,2,8),(16.2,2.4,8),(25.5,2.7,9),(35.7,3,10)]]
    air=profile(floor).difference(unary_union(islands))
    additions['islands']=course('Öarnas väg',floor,[[11,2.85],[20,3.25],[30,3.55],[41,3.85]],[61,3],[1,2],rings=air,hint='Små mellanrum mellan fristående öar. Bromsa på varje ö, placera framhjulet och lyft över gapet. Marken under leder tillbaka.',difficulty='Medel',kind='islands')
    f=smooth([[-8,0],[7,0],[17,.2],[27,0],[39,.15],[50,0]])
    roof=smooth([[-8,3.1],[8,3.1],[18,2.65],[27,3.4],[36,2.7],[50,3.4]])
    air=Polygon([*f,*list(reversed(roof))])
    additions['low']=course('Låga porten',f,[[14,y_at(f,14)+.75],[29,y_at(f,29)+.75],[43,.75]],[47,0],[1,0],theme='cave',rings=air,hint='Här är precision viktigare än fart. Kör mjukt och håll huvudet under de låga portarna.',difficulty='Medel',kind='low-tunnel')
    p=[[-8,0],[7,0]]
    for i in range(10):p.extend([[8+i*3,.6*(i+1)],[10.7+i*3,.6*(i+1)]])
    p.extend([[43,6],[49,6]])
    additions['steps']=course('Trappan mot himlen',p,[[12,1.95],[24,4.35],[39,6.75]],[46,6],[1,0],theme='winter',hint='Uppåt på riktiga trappsteg. Lyft framhjulet vid kanten, luta sedan framåt så att bakhjulet följer med.',difficulty='Medel',kind='staircase')
    p=[[-8,4],[10,4],[10,-3],[32,-3],[43,1],[53,1]]
    hang=course('Kanten och hänget',p,[[8,4.75],[16,2.35],[26,-2.25]],[49,1],[1,4],hint='Kör sakta ut på den tunna balken. Bromsa med bakhjulet nära kanten, häng ner och ta stjärnan. Släpp sedan ner till dalen.',difficulty='Svår',kind='wheel-hang')
    hang['rings'].append({'pts':[[10,4],[17,4],[17,3.74],[10,3.74]],'style':'steel'})
    additions['hang']=hang
    floor=[[-8,2],[5,2],[8,-3],[36,-3],[43,2],[51,2]]
    pillars=[box(x,-1.8,x+2.5,2)for x in [8.5,12.1,15.7,19.3,22.9,26.5,30.1]]
    air=profile(floor).difference(unary_union(pillars))
    additions['balance']=course('Bromsbalansen',floor,[[13.35,2.75],[20.55,2.75],[27.75,2.75]],[47,2],[1,2],rings=air,hint='Smala pelartoppar och korta mellanrum. Bromsa, placera däcken och gå vidare ett gap i taget. Undervägen finns om du ramlar.',difficulty='Svår',kind='precision-pillars')
    p=smooth([[-35,4],[-26,4],[-14,-1],[0,3],[13,-1],[27,5],[39,5]])
    additions['centre']=course('Mittpunkten',p,[[-25,4.7],[27,5.75],[13,-.25]],[34,5],[0,3],direction=-1,theme='sunset',hint='Du börjar i MITTEN och är vänd åt vänster. Ta stjärnan där först, vänd och kör tillbaka över båda dalarna.',difficulty='Svår',kind='central-start')
    # Existing gravity stars and their existing automatic orientation assist, no new physics.
    R,L0,L1=6,-4,48
    oval=Polygon([[L0,0],[L1,0],*arc(L1,R,R,R,-90,90,48)[1:],[L0,2*R],*arc(L0,R,R,R,90,270,48)[1:]])
    additions['gravity']=course('Himmelsvarvet',[[L0,0],[L1,0]],[[45,.75,'up'],[39,11.25],[24,11.25],[6,11.25,'down'],[0,.75]], [15,0],[2,0],theme='cave',rings=oval,hint='Blå stjärna vänder tyngdkraften. Kör i den rundade änden, följ taket tillbaka och ta den blå stjärnan som vänder ner dig igen.',difficulty='Svår',kind='gravity-oval')
    p=smooth([[-8,8],[5,8],[15,1],[24,5],[34,0],[45,5],[56,0],[69,2],[81,2]])
    additions['ravine']=course('Rännans mitt',p,[[x,y_at(p,x)+.75]for x in [15,34,56,72]],[77,2],[1,8],hint='Djupt ner, snabbt upp och ner igen. Pumpa i de breda dalarna och landa med hjulen längs nästa sluttning.',difficulty='Svår',kind='rhythm-ravine')
    p=[[-8,0],[5,0]]
    for i in range(14):p.extend([[6+i*2.4,.7*(i+1)],[7.8+i*2.4,.7*(i+1)]])
    p.extend([[42,9.8],[47,9.8]])
    additions['rocket']=course('Raketen',p,[[10,2.15],[22,5.65],[34,9.15],[43,10.55]],[45,9.8],[1,0],theme='sunset',hint='Kort i sidled, hög på höjden. Haka upp framhjulet stegvis och använd pauserna till att räta upp cykeln.',difficulty='Expert',kind='vertical-climb')
    p=smooth([[-8,24],[5,24],[18,20],[30,23],[44,14],[58,18],[73,8],[88,11],[104,1],[120,2],[135,0],[149,0]])
    additions['lastflow']=course('Sista flytet',p,[[x,y_at(p,x)+.75]for x in [20,46,76,106,137]],[145,0],[1,24],theme='meadow',hint='En lång öppen fartbana med stora landningssluttningar. Behåll flytet men släpp gasen när nästa krön närmar sig.',difficulty='Expert',kind='long-downhill-flow')
    return additions
